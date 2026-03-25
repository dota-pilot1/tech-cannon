package com.mapo.palantier.role.domain;

import java.util.List;
import java.util.Optional;

public interface RoleRepository {
    List<Role> findAll();
    Optional<Role> findById(Long id);
    Optional<Role> findByName(String name);
    Role save(Role role);
    void update(Role role);
    void deleteById(Long id);

    // Role-Authority 관계 조회
    List<Long> findAuthorityIdsByRoleId(Long roleId);
    void addAuthorityToRole(Long roleId, Long authorityId);
    void removeAuthorityFromRole(Long roleId, Long authorityId);
    void removeAllAuthoritiesFromRole(Long roleId);
}
