package com.mapo.palantier.common.exception;

import com.mapo.palantier.common.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 전역 예외 처리 핸들러
 * - 애플리케이션에서 발생하는 모든 예외를 일관된 형식으로 처리
 * - 각 예외 타입별로 적절한 HTTP 상태 코드와 에러 응답 반환
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 인증 실패 예외 처리
     * HTTP Status: 401 Unauthorized
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException e,
            HttpServletRequest request
    ) {
        log.warn("Authentication failed: {} - Path: {}", e.getMessage(), request.getRequestURI());

        ErrorResponse errorResponse = ErrorResponse.of(
                e.getErrorCode().getCode(),
                e.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity
                .status(e.getErrorCode().getHttpStatus())
                .body(errorResponse);
    }

    /**
     * 계정 비활성화 예외 처리
     * HTTP Status: 403 Forbidden
     */
    @ExceptionHandler(AccountInactiveException.class)
    public ResponseEntity<ErrorResponse> handleAccountInactiveException(
            AccountInactiveException e,
            HttpServletRequest request
    ) {
        log.warn("Account inactive: {} - Path: {}", e.getMessage(), request.getRequestURI());

        ErrorResponse errorResponse = ErrorResponse.of(
                e.getErrorCode().getCode(),
                e.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity
                .status(e.getErrorCode().getHttpStatus())
                .body(errorResponse);
    }

    /**
     * 이메일 중복 예외 처리
     * HTTP Status: 409 Conflict
     */
    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateEmailException(
            DuplicateEmailException e,
            HttpServletRequest request
    ) {
        log.warn("Duplicate email: {} - Path: {}", e.getMessage(), request.getRequestURI());

        ErrorResponse errorResponse = ErrorResponse.of(
                e.getErrorCode().getCode(),
                e.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity
                .status(e.getErrorCode().getHttpStatus())
                .body(errorResponse);
    }

    /**
     * 사용자 없음 예외 처리
     * HTTP Status: 404 Not Found
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFoundException(
            UserNotFoundException e,
            HttpServletRequest request
    ) {
        log.warn("User not found: {} - Path: {}", e.getMessage(), request.getRequestURI());

        ErrorResponse errorResponse = ErrorResponse.of(
                e.getErrorCode().getCode(),
                e.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity
                .status(e.getErrorCode().getHttpStatus())
                .body(errorResponse);
    }

    /**
     * 토큰 관련 예외 처리
     * HTTP Status: 401 Unauthorized
     */
    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidTokenException(
            InvalidTokenException e,
            HttpServletRequest request
    ) {
        log.warn("Invalid token: {} - Path: {}", e.getMessage(), request.getRequestURI());

        ErrorResponse errorResponse = ErrorResponse.of(
                e.getErrorCode().getCode(),
                e.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity
                .status(e.getErrorCode().getHttpStatus())
                .body(errorResponse);
    }

    /**
     * 일반적인 IllegalArgumentException 처리
     * HTTP Status: 400 Bad Request
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException e,
            HttpServletRequest request
    ) {
        log.warn("Invalid argument: {} - Path: {}", e.getMessage(), request.getRequestURI());

        ErrorResponse errorResponse = ErrorResponse.of(
                "INVALID_ARGUMENT",
                e.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    /**
     * 일반적인 IllegalStateException 처리
     * HTTP Status: 400 Bad Request
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(
            IllegalStateException e,
            HttpServletRequest request
    ) {
        log.warn("Illegal state: {} - Path: {}", e.getMessage(), request.getRequestURI());

        ErrorResponse errorResponse = ErrorResponse.of(
                "ILLEGAL_STATE",
                e.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    /**
     * 예상하지 못한 모든 예외 처리
     * HTTP Status: 500 Internal Server Error
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(
            Exception e,
            HttpServletRequest request
    ) {
        log.error("Unexpected error occurred: {} - Path: {}", e.getMessage(), request.getRequestURI(), e);

        ErrorResponse errorResponse = ErrorResponse.of(
                "INTERNAL_SERVER_ERROR",
                "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                request.getRequestURI()
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
    }
}
