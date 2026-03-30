package com.mapo.palantier.authority.application;

import com.mapo.palantier.authority.domain.Authority;
import com.mapo.palantier.authority.domain.AuthorityRepository;
import com.mapo.palantier.authority.domain.OrganizationAuthority;
import com.mapo.palantier.authority.domain.UserAuthority;
import com.mapo.palantier.authority.domain.UserAuthorityRepository;
import com.mapo.palantier.authority.infrastructure.OrganizationAuthorityMapper;
import com.mapo.palantier.user.domain.User;
import com.mapo.palantier.user.infrastructure.UserMapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationAuthorityService {

    private final OrganizationAuthorityMapper organizationAuthorityMapper;
    private final AuthorityRepository authorityRepository;
    private final UserAuthorityRepository userAuthorityRepository;
    private final UserMapper userMapper;

    /**
     * 조직의 권한 목록 조회 (Authority 정보 포함)
     */
    public List<OrganizationAuthority> getOrganizationAuthorities(Long orgId) {
        return organizationAuthorityMapper.findByOrganizationId(orgId);
    }

    /**
     * 조직 권한 일괄 업데이트 (diff 방식)
     * - 기존에 있지만 새 목록에 없는 권한 → 삭제
     * - 새 목록에 있지만 기존에 없는 권한 → 추가
     *
     * @param orgId        조직 ID
     * @param authorityIds 새로운 권한 ID 목록
     * @param grantedBy    부여자 ID
     */
    @Transactional
    public void updateOrganizationAuthorities(
        Long orgId,
        List<Long> authorityIds,
        Long grantedBy
    ) {
        // 1. 기존 권한 조회
        List<OrganizationAuthority> existing =
            organizationAuthorityMapper.findByOrganizationId(orgId);
        List<Long> existingIds = existing
            .stream()
            .map(OrganizationAuthority::getAuthorityId)
            .collect(Collectors.toList());

        // 2. 삭제할 권한 (기존에는 있었지만 새 목록에는 없음)
        List<Long> toRevoke = existingIds
            .stream()
            .filter(id -> !authorityIds.contains(id))
            .collect(Collectors.toList());

        // 3. 추가할 권한 (새 목록에는 있지만 기존에는 없음)
        List<Long> toGrant = authorityIds
            .stream()
            .filter(id -> !existingIds.contains(id))
            .collect(Collectors.toList());

        // 4. 권한 회수
        for (Long authorityId : toRevoke) {
            organizationAuthorityMapper.delete(orgId, authorityId);
            log.info(
                "Revoked authority {} from organization {}",
                authorityId,
                orgId
            );
        }

        // 5. 권한 부여
        LocalDateTime now = LocalDateTime.now();
        for (Long authorityId : toGrant) {
            OrganizationAuthority orgAuthority = OrganizationAuthority.builder()
                .organizationId(orgId)
                .authorityId(authorityId)
                .grantedAt(now)
                .grantedBy(grantedBy)
                .notes("Granted by admin")
                .build();
            organizationAuthorityMapper.insert(orgAuthority);
            log.info(
                "Granted authority {} to organization {} by {}",
                authorityId,
                orgId,
                grantedBy
            );
        }

        log.info(
            "Updated authorities for organization {}: revoked={}, granted={}",
            orgId,
            toRevoke.size(),
            toGrant.size()
        );
    }

    /**
     * 전체 권한 목록 조회 (권한 할당 UI용)
     */
    public List<Authority> getAllAuthorities() {
        return authorityRepository.findAll();
    }

    /**
     * 팀원 권한 동기화
     * - 해당 조직에 설정된 권한을 소속 팀원 전원의 user_authority에 즉시 추가
     * - 기존 개인 권한은 유지 (덮어쓰기 X, 없는 것만 추가)
     *
     * @param orgId     조직 ID
     * @param grantedBy 동기화 실행자 ID
     * @return 동기화된 팀원 수
     */
    @Transactional
    public int syncAuthoritiesToMembers(Long orgId, Long grantedBy) {
        // 1. 조직에 설정된 권한 목록 조회
        List<OrganizationAuthority> orgAuthorities =
            organizationAuthorityMapper.findByOrganizationId(orgId);

        if (orgAuthorities.isEmpty()) {
            log.info("Organization {} has no authorities to sync", orgId);
            return 0;
        }

        // 2. 해당 조직 소속 팀원 목록 조회
        List<User> members = userMapper.findByOrganizationId(orgId);

        if (members.isEmpty()) {
            log.info("Organization {} has no members to sync", orgId);
            return 0;
        }

        LocalDateTime now = LocalDateTime.now();
        int syncedCount = 0;

        // 3. 팀원별로 없는 권한만 추가
        for (User member : members) {
            for (OrganizationAuthority orgAuth : orgAuthorities) {
                boolean alreadyExists = userAuthorityRepository.exists(
                    member.getId(),
                    orgAuth.getAuthorityId()
                );

                if (!alreadyExists) {
                    UserAuthority userAuthority = UserAuthority.builder()
                        .userId(member.getId())
                        .authorityId(orgAuth.getAuthorityId())
                        .grantedAt(now)
                        .grantedBy(grantedBy)
                        .notes("Synced from organization: " + orgId)
                        .build();
                    userAuthorityRepository.grant(userAuthority);
                    log.info(
                        "Synced authority {} to user {} from org {}",
                        orgAuth.getAuthorityId(),
                        member.getId(),
                        orgId
                    );
                }
            }
            syncedCount++;
        }

        log.info(
            "Synced {} authorities to {} members in organization {}",
            orgAuthorities.size(),
            syncedCount,
            orgId
        );
        return syncedCount;
    }
}
