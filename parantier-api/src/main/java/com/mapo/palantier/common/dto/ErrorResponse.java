package com.mapo.palantier.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@Schema(description = "에러 응답")
public class ErrorResponse {

    @Schema(description = "에러 코드", example = "AUTH_FAILED", requiredMode = Schema.RequiredMode.REQUIRED)
    private String errorCode;

    @Schema(description = "에러 메시지", example = "이메일 또는 비밀번호가 일치하지 않습니다.", requiredMode = Schema.RequiredMode.REQUIRED)
    private String message;

    @Schema(description = "에러 발생 시각", example = "2024-01-15T10:30:00", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDateTime timestamp;

    @Schema(description = "요청 경로", example = "/api/auth/login")
    private String path;

    public static ErrorResponse of(String errorCode, String message, String path) {
        return ErrorResponse.builder()
                .errorCode(errorCode)
                .message(message)
                .timestamp(LocalDateTime.now())
                .path(path)
                .build();
    }

    public static ErrorResponse of(String errorCode, String message) {
        return ErrorResponse.builder()
                .errorCode(errorCode)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
