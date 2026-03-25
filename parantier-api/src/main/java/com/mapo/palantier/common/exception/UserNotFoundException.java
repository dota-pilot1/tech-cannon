package com.mapo.palantier.common.exception;

import lombok.Getter;

/**
 * 사용자를 찾을 수 없을 때 발생하는 예외
 * HTTP Status: 404 Not Found
 */
@Getter
public class UserNotFoundException extends RuntimeException {

    private final ErrorCode errorCode;

    public UserNotFoundException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public UserNotFoundException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }
}
