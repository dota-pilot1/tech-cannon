package com.mapo.palantier.authority.application;

import com.mapo.palantier.authority.domain.Authority;
import com.mapo.palantier.authority.domain.AuthorityRepository;
import com.mapo.palantier.authority.domain.UserAuthority;
import com.mapo.palantier.authority.domain.UserAuthorityRepository;
import com.mapo.palantier.authority.presentation.dto.UserAuthorityResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserAuthorityService {
    private final UserAuthorityRepository userAuthorityRepository;
    private final AuthorityRepository authorityRepository;

    /**
     * 사용자의 현재 권한 목록 조회 (Authority 정보 포함)
     */
    public List<UserAuthorityResponse> getUserAuthorities(Long userId) {
        List<UserAuthority> userAuthorities = userAuthorityRepository.findByUserId(userId);

        return userAuthorities.stream()
                .map(UserAuthorityResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 사용자 권한 일괄 업데이트
     * @param userId 사용자 ID
     * @param authorityIds 새로운 권한 ID 목록
     * @param grantedBy 부여자 ID
     */
    @Transactional
    public void updateUserAuthorities(Long userId, List<Long> authorityIds, Long grantedBy) {
        // 1. 기존 권한 조회
        List<UserAuthority> existing = userAuthorityRepository.findByUserId(userId);
        List<Long> existingIds = existing.stream()
                .map(UserAuthority::getAuthorityId)
                .collect(Collectors.toList());

        // 2. 삭제할 권한 (기존에는 있었지만 새 목록에는 없음)
        List<Long> toRevoke = existingIds.stream()
                .filter(id -> !authorityIds.contains(id))
                .collect(Collectors.toList());

        // 3. 추가할 권한 (새 목록에는 있지만 기존에는 없음)
        List<Long> toGrant = authorityIds.stream()
                .filter(id -> !existingIds.contains(id))
                .collect(Collectors.toList());

        // 4. 권한 회수
        LocalDateTime now = LocalDateTime.now();
        for (Long authorityId : toRevoke) {
            userAuthorityRepository.revoke(userId, authorityId);
            log.info("Revoked authority {} from user {}", authorityId, userId);
        }

        // 5. 권한 부여
        for (Long authorityId : toGrant) {
            UserAuthority userAuthority = UserAuthority.builder()
                    .userId(userId)
                    .authorityId(authorityId)
                    .grantedAt(now)
                    .grantedBy(grantedBy)
                    .notes("Granted by admin")
                    .build();
            userAuthorityRepository.grant(userAuthority);
            log.info("Granted authority {} to user {} by {}", authorityId, userId, grantedBy);
        }

        log.info("Updated authorities for user {}: revoked={}, granted={}",
                userId, toRevoke.size(), toGrant.size());
    }

    /**
     * 전체 권한 목록 조회 (권한 할당 UI용)
     */
    public List<Authority> getAllAuthorities() {
        return authorityRepository.findAll();
    }
}
