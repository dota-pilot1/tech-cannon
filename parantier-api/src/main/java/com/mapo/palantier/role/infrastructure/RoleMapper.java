package com.mapo.palantier.role.infrastructure;

import com.mapo.palantier.role.domain.Role;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface RoleMapper {
    List<Role> findAll();
    Optional<Role> findById(@Param("id") Long id);
    Optional<Role> findByName(@Param("name") String name);
    void insert(Role role);
    void update(Role role);
    void deleteById(@Param("id") Long id);

    // Role-Authority 관계 조회
    List<Long> findAuthorityIdsByRoleId(@Param("roleId") Long roleId);
    void insertRoleAuthority(@Param("roleId") Long roleId, @Param("authorityId") Long authorityId);
    void deleteRoleAuthority(@Param("roleId") Long roleId, @Param("authorityId") Long authorityId);
    void deleteAllRoleAuthorities(@Param("roleId") Long roleId);
}
