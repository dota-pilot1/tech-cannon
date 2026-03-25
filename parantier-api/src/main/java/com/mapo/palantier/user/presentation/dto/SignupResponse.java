package com.mapo.palantier.user.presentation.dto;

import com.mapo.palantier.user.domain.User;
import com.mapo.palantier.user.domain.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
@Schema(description = "회원가입 응답")
public class SignupResponse {

    @Schema(description = "사용자 ID")
    private Long id;

    @Schema(description = "이메일")
    private String email;

    @Schema(description = "사용자 이름")
    private String username;

    @Schema(description = "권한")
    private UserRole role;

    @Schema(description = "생성일시")
    private LocalDateTime createdAt;

    public static SignupResponse from(User user) {
        return SignupResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
