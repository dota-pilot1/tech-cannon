package com.mapo.palantier.user.domain;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    private Long id;
    private String email;
    private String password;
    private String username;
    private UserRole role;
    private Long organizationId;
    private Boolean isActive;
    private String profileImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 도메인 로직: 새 사용자 생성 팩토리 메서드
    public static User createNewUser(
        String email,
        String encodedPassword,
        String username
    ) {
        return User.builder()
            .email(email)
            .password(encodedPassword)
            .username(username)
            .role(UserRole.ROLE_USER)
            .isActive(true)
            .build();
    }

    // 도메인 로직: 계정 비활성화
    public void deactivate() {
        this.isActive = false;
    }

    // 도메인 로직: 계정 활성화
    public void activate() {
        this.isActive = true;
    }

    // 도메인 로직: 관리자 여부 확인
    public boolean isAdmin() {
        return this.role == UserRole.ROLE_ADMIN;
    }

    // 도메인 메서드: 사용자명 변경
    public User withUsername(String username) {
        return User.builder()
            .id(this.id)
            .email(this.email)
            .password(this.password)
            .username(username)
            .role(this.role)
            .organizationId(this.organizationId)
            .isActive(this.isActive)
            .profileImageUrl(this.profileImageUrl)
            .createdAt(this.createdAt)
            .build();
    }

    // 도메인 메서드: 비밀번호 변경
    public User withPassword(String encodedPassword) {
        return User.builder()
            .id(this.id)
            .email(this.email)
            .password(encodedPassword)
            .username(this.username)
            .role(this.role)
            .organizationId(this.organizationId)
            .isActive(this.isActive)
            .profileImageUrl(this.profileImageUrl)
            .createdAt(this.createdAt)
            .build();
    }

    // 도메인 메서드: 프로필 이미지 변경
    public User withProfileImage(String profileImageUrl) {
        return User.builder()
            .id(this.id)
            .email(this.email)
            .password(this.password)
            .username(this.username)
            .role(this.role)
            .organizationId(this.organizationId)
            .isActive(this.isActive)
            .profileImageUrl(profileImageUrl)
            .createdAt(this.createdAt)
            .build();
    }

    // 도메인 메서드: 역할 변경
    public User withRole(UserRole role) {
        return User.builder()
            .id(this.id)
            .email(this.email)
            .password(this.password)
            .username(this.username)
            .role(role)
            .organizationId(this.organizationId)
            .isActive(this.isActive)
            .profileImageUrl(this.profileImageUrl)
            .createdAt(this.createdAt)
            .build();
    }

    // 도메인 메서드: 조직 변경
    public User withOrganization(Long organizationId) {
        return User.builder()
            .id(this.id)
            .email(this.email)
            .password(this.password)
            .username(this.username)
            .role(this.role)
            .organizationId(organizationId)
            .isActive(this.isActive)
            .profileImageUrl(this.profileImageUrl)
            .createdAt(this.createdAt)
            .build();
    }
}
