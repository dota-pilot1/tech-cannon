package com.mapo.palantier.common.exception;

import lombok.Getter;

/**
 * 이메일 중복 시 발생하는 예외
 * HTTP Status: 409 Conflict
 */
@Getter
public class DuplicateEmailException extends RuntimeException {

    private final ErrorCode errorCode;

    public DuplicateEmailException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public DuplicateEmailException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }
}
