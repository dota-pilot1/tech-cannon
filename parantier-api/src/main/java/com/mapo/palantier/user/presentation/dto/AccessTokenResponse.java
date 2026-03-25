package com.mapo.palantier.user.presentation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
@Schema(description = "액세스 토큰 응답 (리프레시 시)")
public class AccessTokenResponse {

    @Schema(description = "JWT 액세스 토큰", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", requiredMode = Schema.RequiredMode.REQUIRED)
    private String accessToken;

    @Schema(description = "토큰 타입", example = "Bearer", requiredMode = Schema.RequiredMode.REQUIRED)
    private String tokenType;

    public static AccessTokenResponse of(String accessToken) {
        return AccessTokenResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .build();
    }
}
