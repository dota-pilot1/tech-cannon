package com.mapo.palantier.user.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 도메인 로직: 새 사용자 생성 팩토리 메서드
    public static User createNewUser(String email, String encodedPassword, String username) {
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
}