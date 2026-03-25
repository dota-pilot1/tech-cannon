package com.mapo.palantier.authority.application;

import com.mapo.palantier.authority.domain.Authority;
import com.mapo.palantier.authority.domain.AuthorityRepository;
import com.mapo.palantier.authority.domain.UserAuthority;
import com.mapo.palantier.authority.domain.UserAuthorityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthorityService {
    private final AuthorityRepository authorityRepository;
    private final UserAuthorityRepository userAuthorityRepository;

    /**
     * 역할로 권한 목록 조회
     * 예: ROLE_ADMIN → [MENU:ADMIN:READ, MENU:ADMIN:WRITE, PROJECT:CREATE, ...]
     */
    public List<String> getAuthoritiesByRole(String role) {
        return authorityRepository.findAuthorityNamesByRole(role);
    }

    /**
     * 모든 권한 조회
     */
    public List<Authority> getAllAuthorities() {
        return authorityRepository.findAll();
    }

    /**
     * 카테고리별 권한 조회
     */
    public List<Authority> getAuthoritiesByCategory(String category) {
        return authorityRepository.findByCategory(category);
    }

    /**
     * 권한 생성
     */
    @Transactional
    public Authority createAuthority(String name, String description, Long categoryId) {
        Authority authority = Authority.builder()
                .name(name)
                .description(description)
                .categoryId(categoryId)
                .build();
        authorityRepository.create(authority);
        return authority;
    }

    /**
     * 권한 수정
     */
    @Transactional
    public Authority updateAuthority(Long id, String name, String description, Long categoryId) {
        Authority authority = Authority.builder()
                .id(id)
                .name(name)
                .description(description)
                .categoryId(categoryId)
                .build();
        authorityRepository.update(authority);
        return authority;
    }

    /**
     * 권한 삭제
     */
    @Transactional
    public void deleteAuthority(Long id) {
        authorityRepository.delete(id);
    }

    /**
     * 역할-권한 매핑 업데이트
     */
    @Transactional
    public void updateRoleAuthorities(String role, List<Long> authorityIds) {
        authorityRepository.updateRoleAuthorities(role, authorityIds);
    }

    // ==================== 사용자별 권한 관리 ====================

    /**
     * 사용자의 개별 권한 목록 조회 (Authority 정보 포함)
     */
    public List<UserAuthority> getUserAuthorities(Long userId) {
        return userAuthorityRepository.findByUserId(userId);
    }

    /**
     * 사용자의 유효한 개별 권한만 조회
     */
    public List<UserAuthority> getValidUserAuthorities(Long userId) {
        return userAuthorityRepository.findValidByUserId(userId);
    }

    /**
     * 사용자의 모든 유효 권한 조회 (역할 권한 + 개별 권한)
     * 최종적으로 사용자가 가진 모든 권한 문자열 리스트 반환
     * 예: [MENU:ADMIN:READ, MENU:ADMIN:WRITE, PROJECT:CREATE, ...]
     */
    public List<String> getUserEffectiveAuthorities(Long userId, String role) {
        // 1. 역할 기반 권한 조회
        List<String> roleAuthorities = authorityRepository.findAuthorityNamesByRole(role);

        // 2. 개별 사용자 권한 조회 (유효한 것만)
        List<String> userAuthorities = userAuthorityRepository.findValidByUserId(userId)
                .stream()
                .map(ua -> ua.getAuthority().getName())
                .collect(Collectors.toList());

        // 3. 중복 제거 후 병합
        return Stream.concat(roleAuthorities.stream(), userAuthorities.stream())
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * 사용자에게 권한 부여
     */
    @Transactional
    public void grantUserAuthority(Long userId, Long authorityId, Long grantedBy, LocalDateTime expiresAt, String notes) {
        // 이미 존재하는지 확인
        if (userAuthorityRepository.exists(userId, authorityId)) {
            log.warn("User {} already has authority {}", userId, authorityId);
            throw new IllegalArgumentException("User already has this authority");
        }

        UserAuthority userAuthority = UserAuthority.builder()
                .userId(userId)
                .authorityId(authorityId)
                .grantedAt(LocalDateTime.now())
                .grantedBy(grantedBy)
                .expiresAt(expiresAt)
                .notes(notes)
                .build();

        userAuthorityRepository.grant(userAuthority);
        log.info("Granted authority {} to user {} by user {}", authorityId, userId, grantedBy);
    }

    /**
     * 사용자 권한 회수
     */
    @Transactional
    public void revokeUserAuthority(Long userId, Long authorityId) {
        if (!userAuthorityRepository.exists(userId, authorityId)) {
            log.warn("User {} does not have authority {}", userId, authorityId);
            throw new IllegalArgumentException("User does not have this authority");
        }

        userAuthorityRepository.revoke(userId, authorityId);
        log.info("Revoked authority {} from user {}", authorityId, userId);
    }

    /**
     * 사용자의 모든 개별 권한 회수
     */
    @Transactional
    public void revokeAllUserAuthorities(Long userId) {
        userAuthorityRepository.revokeAll(userId);
        log.info("Revoked all authorities from user {}", userId);
    }

    /**
     * 사용자가 특정 권한을 가지고 있는지 확인
     */
    public boolean userHasAuthority(Long userId, Long authorityId) {
        return userAuthorityRepository.exists(userId, authorityId);
    }
}
