package com.mapo.palantier.user.presentation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "로그인 요청")
public class LoginRequest {

    @Schema(description = "이메일", example = "terecal@daum.net")
    private String email;

    @Schema(description = "비밀번호", example = "password123!")
    private String password;
}
