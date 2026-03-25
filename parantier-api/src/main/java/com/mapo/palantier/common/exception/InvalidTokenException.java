package com.mapo.palantier.common.exception;

import lombok.Getter;

/**
 * 토큰 관련 예외
 * - 유효하지 않은 토큰
 * - 만료된 토큰
 * - 잘못된 토큰 타입
 * - 리프레시 토큰을 찾을 수 없음
 * HTTP Status: 401 Unauthorized
 */
@Getter
public class InvalidTokenException extends RuntimeException {

    private final ErrorCode errorCode;

    public InvalidTokenException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public InvalidTokenException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }
}
