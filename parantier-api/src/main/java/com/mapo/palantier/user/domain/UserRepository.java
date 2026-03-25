package com.mapo.palantier.user.domain;

import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository {
    void save(User user);
    Optional<User> findByEmail(String email);
    Optional<User> findById(@Param("id") Long id);
    boolean existsByEmail(String email);
    List<User> findAll();
    void updateRole(Long id, UserRole role);
    void updateOrganization(@Param("id") Long id, @Param("organizationId") Long organizationId);
}