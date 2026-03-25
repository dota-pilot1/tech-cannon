package com.mapo.palantier.role.application;

import com.mapo.palantier.authority.domain.UserAuthority;
import com.mapo.palantier.authority.domain.UserAuthorityRepository;
import com.mapo.palantier.role.domain.Role;
import com.mapo.palantier.role.domain.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleService {
    private final RoleRepository roleRepository;
    private final UserAuthorityRepository userAuthorityRepository;

    /**
     * 모든 역할 조회
     */
    public List<Role> getAllRoles() {
        List<Role> roles = roleRepository.findAll();

        // 각 역할이 가진 권한 ID 목록 로드
        for (Role role : roles) {
            List<Long> authorityIds = roleRepository.findAuthorityIdsByRoleId(role.getId());
            role.setAuthorityIds(authorityIds);
        }

        return roles;
    }

    /**
     * ID로 역할 조회
     */
    public Role getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + id));

        // 권한 ID 목록 로드
        List<Long> authorityIds = roleRepository.findAuthorityIdsByRoleId(role.getId());
        role.setAuthorityIds(authorityIds);

        return role;
    }

    /**
     * 이름으로 역할 조회
     */
    public Role getRoleByName(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + name));
    }

    /**
     * 역할 생성
     */
    @Transactional
    public Role createRole(String name, String description) {
        // 중복 체크
        roleRepository.findByName(name).ifPresent(existing -> {
            throw new IllegalArgumentException("Role already exists: " + name);
        });

        Role role = Role.builder()
                .name(name)
                .description(description)
                .build();

        return roleRepository.save(role);
    }

    /**
     * 역할 수정
     */
    @Transactional
    public void updateRole(Long id, String name, String description) {
        Role role = getRoleById(id);

        // 이름 변경 시 중복 체크
        if (!role.getName().equals(name)) {
            roleRepository.findByName(name).ifPresent(existing -> {
                throw new IllegalArgumentException("Role name already exists: " + name);
            });
        }

        Role updated = Role.builder()
                .id(id)
                .name(name)
                .description(description)
                .createdAt(role.getCreatedAt())
                .build();

        roleRepository.update(updated);
    }

    /**
     * 역할 삭제
     * 권한 중심 설계: 역할은 단순 템플릿이므로 삭제 시 사용자 확인 불필요
     */
    @Transactional
    public void deleteRole(Long id) {
        // 역할에 연결된 권한 먼저 삭제
        roleRepository.removeAllAuthoritiesFromRole(id);

        // 역할 삭제
        roleRepository.deleteById(id);
    }

    /**
     * 역할에 권한 추가
     */
    @Transactional
    public void addAuthorityToRole(Long roleId, Long authorityId) {
        // 역할 존재 확인
        getRoleById(roleId);

        roleRepository.addAuthorityToRole(roleId, authorityId);
        log.info("Added authority {} to role {}", authorityId, roleId);
    }

    /**
     * 역할에서 권한 제거
     */
    @Transactional
    public void removeAuthorityFromRole(Long roleId, Long authorityId) {
        roleRepository.removeAuthorityFromRole(roleId, authorityId);
        log.info("Removed authority {} from role {}", authorityId, roleId);
    }

    /**
     * 역할의 권한 목록 일괄 업데이트
     */
    @Transactional
    public void updateRoleAuthorities(Long roleId, List<Long> authorityIds) {
        // 기존 권한 모두 삭제
        roleRepository.removeAllAuthoritiesFromRole(roleId);

        // 새 권한 목록 추가
        for (Long authorityId : authorityIds) {
            roleRepository.addAuthorityToRole(roleId, authorityId);
        }

        log.info("Updated authorities for role {}: {}", roleId, authorityIds);
    }

    /**
     * 사용자에게 역할 부여 (권한 중심 설계: 역할의 권한을 user_authority에 복사)
     */
    @Transactional
    public void grantRoleToUser(Long userId, Long roleId, Long grantedBy) {
        // 역할의 권한 ID 목록 조회
        List<Long> authorityIds = roleRepository.findAuthorityIdsByRoleId(roleId);

        // 각 권한을 user_authority에 추가
        LocalDateTime now = LocalDateTime.now();
        for (Long authorityId : authorityIds) {
            // 이미 가지고 있는 권한은 스킵
            if (!userAuthorityRepository.exists(userId, authorityId)) {
                UserAuthority userAuthority = UserAuthority.builder()
                        .userId(userId)
                        .authorityId(authorityId)
                        .grantedAt(now)
                        .grantedBy(grantedBy)
                        .notes("Granted from role: " + roleId)
                        .build();
                userAuthorityRepository.grant(userAuthority);
            }
        }

        log.info("Granted role {} authorities to user {} by {}", roleId, userId, grantedBy);
    }

    /**
     * 사용자로부터 역할 회수 (권한 중심 설계: 해당 역할에서 부여된 권한 제거)
     * 주의: 다른 경로로 부여된 같은 권한은 유지됨
     */
    @Transactional
    public void revokeRoleFromUser(Long userId, Long roleId) {
        // 역할의 권한 ID 목록 조회
        List<Long> authorityIds = roleRepository.findAuthorityIdsByRoleId(roleId);

        // 각 권한을 user_authority에서 제거
        for (Long authorityId : authorityIds) {
            userAuthorityRepository.revoke(userId, authorityId);
        }

        log.info("Revoked role {} authorities from user {}", roleId, userId);
    }
}
