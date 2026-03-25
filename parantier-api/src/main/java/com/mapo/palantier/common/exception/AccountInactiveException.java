package com.mapo.palantier.common.exception;

import lombok.Getter;

/**
 * 비활성화된 계정 접근 시 발생하는 예외
 * HTTP Status: 403 Forbidden
 */
@Getter
public class AccountInactiveException extends RuntimeException {

    private final ErrorCode errorCode;

    public AccountInactiveException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public AccountInactiveException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }
}
