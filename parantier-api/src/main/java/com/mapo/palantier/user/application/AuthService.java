package com.mapo.palantier.user.application;

import com.mapo.palantier.common.exception.AccountInactiveException;
import com.mapo.palantier.common.exception.AuthenticationException;
import com.mapo.palantier.common.exception.DuplicateEmailException;
import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.InvalidTokenException;
import com.mapo.palantier.common.exception.UserNotFoundException;
import com.mapo.palantier.config.JwtTokenProvider;
import com.mapo.palantier.user.domain.RefreshToken;
import com.mapo.palantier.user.domain.RefreshTokenRepository;
import com.mapo.palantier.user.domain.User;
import com.mapo.palantier.user.domain.UserRepository;
import com.mapo.palantier.user.presentation.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public User signup(String email, String password, String username) {
        // 1. 이메일 중복 체크
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException(ErrorCode.DUPLICATE_EMAIL);
        }

        // 2. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(password);

        // 3. User 도메인 객체 생성 (팩토리 메서드 사용)
        User newUser = User.createNewUser(email, encodedPassword, username);

        // 4. 저장
        userRepository.save(newUser);

        return newUser;
    }

    @Transactional
    public TokenResponse login(String email, String password) {
        // 1. 이메일로 사용자 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException(ErrorCode.INVALID_CREDENTIALS));

        // 2. 비밀번호 검증
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthenticationException(ErrorCode.INVALID_CREDENTIALS);
        }

        // 3. 계정 활성화 여부 확인
        if (!user.getIsActive()) {
            throw new AccountInactiveException(ErrorCode.ACCOUNT_INACTIVE);
        }

        // 4. 액세스 토큰 및 리프레시 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        // 5. 기존 리프레시 토큰 삭제 (1명당 1개의 토큰만 유지)
        refreshTokenRepository.findByUserId(user.getId())
                .ifPresent(existingToken -> refreshTokenRepository.deleteByUserId(user.getId()));

        // 6. 새 리프레시 토큰 저장 (7일 유효)
        RefreshToken newRefreshToken = RefreshToken.create(user.getId(), refreshToken, 7);
        refreshTokenRepository.save(newRefreshToken);

        // 7. 응답 생성
        return TokenResponse.of(accessToken, refreshToken, user.getEmail(), user.getUsername(), user.getRole().name());
    }

    @Transactional
    public String refreshAccessToken(String refreshToken) {
        // 1. 리프레시 토큰 유효성 검증
        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw new InvalidTokenException(ErrorCode.INVALID_TOKEN);
        }

        // 2. DB에서 리프레시 토큰 조회
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new InvalidTokenException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));

        // 3. 만료 여부 확인
        if (storedToken.isExpired()) {
            // 만료된 토큰 삭제
            refreshTokenRepository.deleteByToken(refreshToken);
            throw new InvalidTokenException(ErrorCode.EXPIRED_TOKEN);
        }

        // 4. 사용자 조회
        User user = userRepository.findById(storedToken.getUserId())
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        // 5. 새 액세스 토큰 발급
        return jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public void logout(Long userId) {
        // 리프레시 토큰 삭제로 로그아웃 처리
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public boolean isEmailDuplicate(String email) {
        return userRepository.existsByEmail(email);
    }
}
