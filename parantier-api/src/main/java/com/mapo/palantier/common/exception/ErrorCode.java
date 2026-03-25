package com.mapo.palantier.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 인증 관련 (401)
    AUTHENTICATION_FAILED("AUTHENTICATION_FAILED", "인증에 실패했습니다", HttpStatus.UNAUTHORIZED),
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "이메일 또는 비밀번호가 일치하지 않습니다", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN("INVALID_TOKEN", "유효하지 않은 토큰입니다", HttpStatus.UNAUTHORIZED),
    EXPIRED_TOKEN("EXPIRED_TOKEN", "만료된 토큰입니다", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN_TYPE("INVALID_TOKEN_TYPE", "잘못된 토큰 타입입니다", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_NOT_FOUND("REFRESH_TOKEN_NOT_FOUND", "리프레시 토큰을 찾을 수 없습니다", HttpStatus.UNAUTHORIZED),

    // 권한 관련 (403)
    ACCOUNT_INACTIVE("ACCOUNT_INACTIVE", "비활성화된 계정입니다", HttpStatus.FORBIDDEN),
    ACCESS_DENIED("ACCESS_DENIED", "접근 권한이 없습니다", HttpStatus.FORBIDDEN),

    // 리소스 관련 (404)
    USER_NOT_FOUND("USER_NOT_FOUND", "사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND),

    // 중복 관련 (409)
    DUPLICATE_EMAIL("DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다", HttpStatus.CONFLICT),

    // 서버 에러 (500)
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}