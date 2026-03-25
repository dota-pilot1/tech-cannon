package com.mapo.palantier.common.exception;

import lombok.Getter;

/**
 * 인증 실패 시 발생하는 예외
 * - 이메일이 존재하지 않는 경우
 * - 비밀번호가 일치하지 않는 경우
 * HTTP Status: 401 Unauthorized
 */
@Getter
public class AuthenticationException extends RuntimeException {

    private final ErrorCode errorCode;

    public AuthenticationException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public AuthenticationException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }
}
