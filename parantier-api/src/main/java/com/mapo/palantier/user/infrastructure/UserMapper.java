package com.mapo.palantier.user.infrastructure;

import com.mapo.palantier.user.domain.User;
import com.mapo.palantier.user.domain.UserRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper {
    void insert(User user);
    Optional<User> findByEmail(@Param("email") String email);
    Optional<User> findById(@Param("id") Long id);
    boolean existsByEmail(@Param("email") String email);
    List<User> findAll();
    void updateRole(@Param("id") Long id, @Param("role") UserRole role);
    void updateOrganization(@Param("id") Long id, @Param("organizationId") Long organizationId);
}
