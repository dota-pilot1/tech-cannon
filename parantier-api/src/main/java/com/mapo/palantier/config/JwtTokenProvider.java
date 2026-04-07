package com.mapo.palantier.config;

import com.mapo.palantier.authority.domain.UserAuthorityRepository;
import com.mapo.palantier.authority.infrastructure.OrganizationAuthorityMapper;
import com.mapo.palantier.user.infrastructure.UserMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;
    private final UserAuthorityRepository userAuthorityRepository;
    private final OrganizationAuthorityMapper organizationAuthorityMapper;
    private final UserMapper userMapper;

    public JwtTokenProvider(
        @Value("${jwt.secret}") String secret,
        @Value("${jwt.access-token-expiration}") long accessTokenExpiration,
        @Value("${jwt.refresh-token-expiration}") long refreshTokenExpiration,
        UserAuthorityRepository userAuthorityRepository,
        OrganizationAuthorityMapper organizationAuthorityMapper,
        UserMapper userMapper
    ) {
        this.secretKey = Keys.hmacShaKeyFor(
            secret.getBytes(StandardCharsets.UTF_8)
        );
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
        this.userAuthorityRepository = userAuthorityRepository;
        this.organizationAuthorityMapper = organizationAuthorityMapper;
        this.userMapper = userMapper;
    }

    /**
     * 액세스 토큰 생성 (권한 중심)
     * 개인 권한 + 조직 권한을 합산하여 JWT에 담는다.
     */
    public String generateAccessToken(Long userId, String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpiration);

        // 1. 개인 권한 조회
        List<String> userAuthorities =
            userAuthorityRepository.findAuthorityNamesByUserId(userId);

        // 2. 조직 권한 조회 (소속 조직이 있을 때만)
        List<String> orgAuthorities = new ArrayList<>();
        Long organizationId = userMapper.findOrganizationIdByUserId(userId);
        if (organizationId != null) {
            orgAuthorities =
                organizationAuthorityMapper.findAuthorityNamesByOrganizationId(
                    organizationId
                );
        }

        // 3. 개인 권한 + 조직 권한 합산 (중복 제거)
        List<String> authorities = Stream.concat(
            userAuthorities.stream(),
            orgAuthorities.stream()
        )
            .distinct()
            .sorted()
            .collect(Collectors.toList());

        log.debug(
            "JWT generateAccessToken - userId: {}, email: {}, role: {}, organizationId: {}, authorities: {}",
            userId,
            email,
            role,
            organizationId,
            authorities
        );

        return Jwts.builder()
            .subject(email)
            .claim("userId", userId)
            .claim("role", role)
            .claim("authorities", authorities)
            .claim("type", "ACCESS")
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(secretKey)
            .compact();
    }

    /**
     * 리프레시 토큰 생성
     */
    public String generateRefreshToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpiration);

        return Jwts.builder()
            .subject(email)
            .claim("type", "REFRESH")
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(secretKey)
            .compact();
    }

    /**
     * 기존 코드 호환성을 위한 deprecated 메서드
     * @deprecated Use generateAccessToken(Long, String, String) instead
     */
    @Deprecated
    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpiration);

        return Jwts.builder()
            .subject(email)
            .claim("role", role)
            .claim("authorities", Collections.emptyList())
            .claim("type", "ACCESS")
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(secretKey)
            .compact();
    }

    /**
     * JWT 토큰에서 이메일 추출
     */
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();

        return claims.getSubject();
    }

    /**
     * JWT 토큰에서 사용자 ID 추출
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();

        return claims.get("userId", Long.class);
    }

    /**
     * JWT 토큰에서 역할 추출
     */
    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();

        return claims.get("role", String.class);
    }

    /**
     * JWT 토큰에서 권한 배열 추출
     */
    @SuppressWarnings("unchecked")
    public List<String> getAuthoritiesFromToken(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();

        return claims.get("authorities", List.class);
    }

    /**
     * JWT 토큰에서 타입 추출
     */
    public String getTokenType(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();

        return claims.get("type", String.class);
    }

    /**
     * 액세스 토큰인지 확인
     */
    public boolean isAccessToken(String token) {
        try {
            return "ACCESS".equals(getTokenType(token));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 리프레시 토큰인지 확인
     */
    public boolean isRefreshToken(String token) {
        try {
            return "REFRESH".equals(getTokenType(token));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * JWT 토큰 유효성 검증
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 액세스 토큰 유효성 검증 (타입까지 확인)
     */
    public boolean validateAccessToken(String token) {
        return validateToken(token) && isAccessToken(token);
    }

    /**
     * 리프레시 토큰 유효성 검증 (타입까지 확인)
     */
    public boolean validateRefreshToken(String token) {
        return validateToken(token) && isRefreshToken(token);
    }
}
