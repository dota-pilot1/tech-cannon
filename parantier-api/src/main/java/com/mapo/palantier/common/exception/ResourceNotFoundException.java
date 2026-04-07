package com.mapo.palantier.common.exception;

import lombok.Getter;

/**
 * 리소스를 찾을 수 없을 때 발생하는 공통 예외
 * HTTP Status: 404 Not Found
 *
 * 사용 예시:
 *   throw new ResourceNotFoundException(ErrorCode.TASK_POST_NOT_FOUND);
 *   throw new ResourceNotFoundException(ErrorCode.WIKI_FOLDER_NOT_FOUND);
 */
@Getter
public class ResourceNotFoundException extends RuntimeException {

    private final ErrorCode errorCode;

    public ResourceNotFoundException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public ResourceNotFoundException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }
}
