package com.mapo.palantier.common.exception;

import lombok.Getter;

/**
 * 중복된 리소스가 존재할 때 발생하는 공통 예외
 * HTTP Status: 409 Conflict
 *
 * 사용 예시:
 *   throw new DuplicateException(ErrorCode.DUPLICATE_ROLE);
 *   throw new DuplicateException(ErrorCode.DUPLICATE_CATEGORY);
 *   throw new DuplicateException(ErrorCode.DUPLICATE_AUTHORITY);
 */
@Getter
public class DuplicateException extends RuntimeException {

    private final ErrorCode errorCode;

    public DuplicateException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public DuplicateException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }
}
