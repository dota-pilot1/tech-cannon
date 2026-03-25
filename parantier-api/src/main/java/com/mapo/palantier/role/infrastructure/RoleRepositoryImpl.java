package com.mapo.palantier.role.infrastructure;

import com.mapo.palantier.role.domain.Role;
import com.mapo.palantier.role.domain.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class RoleRepositoryImpl implements RoleRepository {

    private final RoleMapper mapper;

    @Override
    public List<Role> findAll() {
        return mapper.findAll();
    }

    @Override
    public Optional<Role> findById(Long id) {
        return mapper.findById(id);
    }

    @Override
    public Optional<Role> findByName(String name) {
        return mapper.findByName(name);
    }

    @Override
    public Role save(Role role) {
        mapper.insert(role);
        return role;
    }

    @Override
    public void update(Role role) {
        mapper.update(role);
    }

    @Override
    public void deleteById(Long id) {
        mapper.deleteById(id);
    }

    @Override
    public List<Long> findAuthorityIdsByRoleId(Long roleId) {
        return mapper.findAuthorityIdsByRoleId(roleId);
    }

    @Override
    public void addAuthorityToRole(Long roleId, Long authorityId) {
        mapper.insertRoleAuthority(roleId, authorityId);
    }

    @Override
    public void removeAuthorityFromRole(Long roleId, Long authorityId) {
        mapper.deleteRoleAuthority(roleId, authorityId);
    }

    @Override
    public void removeAllAuthoritiesFromRole(Long roleId) {
        mapper.deleteAllRoleAuthorities(roleId);
    }
}
