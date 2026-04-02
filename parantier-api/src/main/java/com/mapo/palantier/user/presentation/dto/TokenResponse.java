package com.mapo.palantier.user.presentation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
@Schema(description = "토큰 응답 (액세스 + 리프레시)")
public class TokenResponse {

    @Schema(
        description = "사용자 ID",
        example = "1",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private Long userId;

    @Schema(
        description = "JWT 액세스 토큰",
        example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String accessToken;

    @Schema(
        description = "JWT 리프레시 토큰",
        example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String refreshToken;

    @Schema(
        description = "토큰 타입",
        example = "Bearer",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String tokenType;

    @Schema(
        description = "사용자 이메일",
        example = "terecal@daum.net",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String email;

    @Schema(
        description = "사용자 이름",
        example = "오현석",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String username;

    @Schema(
        description = "사용자 역할",
        example = "ROLE_USER",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String role;

    public static TokenResponse of(
        Long userId,
        String accessToken,
        String refreshToken,
        String email,
        String username,
        String role
    ) {
        return TokenResponse.builder()
            .userId(userId)
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .email(email)
            .username(username)
            .role(role)
            .build();
    }
}
