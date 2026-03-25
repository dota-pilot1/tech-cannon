package com.mapo.palantier.user.presentation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "회원가입 요청")
public class SignupRequest {

    @Schema(description = "이메일", example = "terecal@daum.net")
    private String email;

    @Schema(description = "비밀번호", example = "password123!")
    private String password;

    @Schema(description = "사용자 이름", example = "오현석")
    private String username;
}
