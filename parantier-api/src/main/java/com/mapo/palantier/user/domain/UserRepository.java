package com.mapo.palantier.user.domain;

import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Param;

public interface UserRepository {
    void save(User user);
    Optional<User> findByEmail(String email);
    Optional<User> findById(@Param("id") Long id);
    boolean existsByEmail(String email);
    List<User> findAll();
    void deleteById(Long id);
    void deleteByIds(List<Long> ids);
    void updateRole(Long id, UserRole role);
    void updateOrganization(
        @Param("id") Long id,
        @Param("organizationId") Long organizationId
    );
    void updateUsername(
        @Param("id") Long id,
        @Param("username") String username
    );
    void updatePassword(
        @Param("id") Long id,
        @Param("password") String password
    );
    void updateProfileImage(
        @Param("id") Long id,
        @Param("profileImageUrl") String profileImageUrl
    );
}
