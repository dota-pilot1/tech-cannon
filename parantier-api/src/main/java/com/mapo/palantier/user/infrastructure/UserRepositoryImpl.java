package com.mapo.palantier.user.infrastructure;

import com.mapo.palantier.user.domain.User;
import com.mapo.palantier.user.domain.UserRepository;
import com.mapo.palantier.user.domain.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

    private final UserMapper userMapper;

    @Override
    public void save(User user) {
        userMapper.insert(user);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userMapper.findById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userMapper.existsByEmail(email);
    }

    @Override
    public List<User> findAll() {
        return userMapper.findAll();
    }

    @Override
    public void updateRole(Long id, UserRole role) {
        userMapper.updateRole(id, role);
    }

    @Override
    public void updateOrganization(Long id, Long organizationId) {
        userMapper.updateOrganization(id, organizationId);
    }
}
