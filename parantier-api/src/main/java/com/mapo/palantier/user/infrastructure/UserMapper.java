package com.mapo.palantier.user.infrastructure;

import com.mapo.palantier.user.domain.User;
import com.mapo.palantier.user.domain.UserRole;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    void insert(User user);
    Optional<User> findByEmail(@Param("email") String email);
    Optional<User> findById(@Param("id") Long id);
    boolean existsByEmail(@Param("email") String email);
    List<User> findAll();
    void deleteById(@Param("id") Long id);
    void deleteByIds(@Param("ids") List<Long> ids);
    void updateRole(@Param("id") Long id, @Param("role") UserRole role);
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
    String findUsernameById(@Param("id") Long id);
    Long findOrganizationIdByUserId(@Param("id") Long id);
    List<User> findByOrganizationId(
        @Param("organizationId") Long organizationId
    );
}
