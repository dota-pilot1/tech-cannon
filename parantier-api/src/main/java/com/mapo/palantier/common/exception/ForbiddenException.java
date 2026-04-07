package com.mapo.palantier.common.exception;

import lombok.Getter;

/**
 * 권한이 없을 때 발생하는 공통 예외
 * HTTP Status: 403 Forbidden
 *
 * 사용 예시:
 *   throw new ForbiddenException(ErrorCode.FORBIDDEN_UPDATE);
 *   throw new ForbiddenException(ErrorCode.FORBIDDEN_DELETE);
 */
@Getter
public class ForbiddenException extends RuntimeException {

    private final ErrorCode errorCode;

    public ForbiddenException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public ForbiddenException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }
}
