# ErrorCode Enum 도입으로 매직 스트링 제거

## 개요

기존 커스텀 예외 처리에서 에러 코드를 문자열("DUPLICATE_EMAIL")로 하드코딩하던 방식을
**ErrorCode Enum**으로 변경하여 타입 안정성과 유지보수성을 향상시켰습니다.

## 문제점: 매직 스트링(Magic String)

### Before (문제 있는 코드)

```java
// AuthService.java
throw new DuplicateEmailException("이미 존재하는 이메일입니다");

// GlobalExceptionHandler.java
ErrorResponse errorResponse = ErrorResponse.of(
    "DUPLICATE_EMAIL",  // ← 매직 스트링
    e.getMessage(),
    request.getRequestURI()
);
```

### 매직 스트링의 문제점

1. **컴파일 타임 안정성 없음**
   ```java
   "DUPLICATE_EMAIL"  // ✅ 정상
   "DUPLICAT_EMAIL"   // ❌ 오타인데 컴파일 에러 안 남
   "duplicate_email"  // ❌ 대소문자 틀려도 모름
   ```

2. **일관성 보장 안 됨**
   ```java
   // 여기선 이렇게
   ErrorResponse.of("DUPLICATE_EMAIL", ...)

   // 저기선 저렇게
   ErrorResponse.of("DUPLICATED_EMAIL", ...)

   // 또 다른 곳에선 다르게
   ErrorResponse.of("EMAIL_DUPLICATE", ...)
   ```

3. **재사용 어려움**
   - 에러 코드가 코드 곳곳에 흩어져 있음
   - 프론트엔드 개발자에게 에러 코드 목록 알려주기 어려움
   - 에러 코드 변경 시 전체 검색해서 수정해야 함

4. **HTTP 상태 코드 중복 정의**
   ```java
   // Exception마다 HTTP 상태 코드를 각각 정의
   return ResponseEntity.status(HttpStatus.CONFLICT).body(...);
   return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(...);
   ```

## 해결 방법: ErrorCode Enum 도입

### 1. ErrorCode Enum 생성

**파일**: `src/main/java/com/mapo/palantier/common/exception/ErrorCode.java`

```java
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
```

**핵심 개선점**:
- 모든 에러 코드가 한 곳에 모여 있음
- 에러 코드, 메시지, HTTP 상태 코드를 함께 관리
- IDE 자동완성 지원
- 컴파일 타임 타입 체크

### 2. Exception 클래스 수정

**Before**:
```java
public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String message) {
        super(message);
    }
}
```

**After**:
```java
@Getter
public class DuplicateEmailException extends RuntimeException {
    private final ErrorCode errorCode;

    public DuplicateEmailException(ErrorCode errorCode) {
        super(errorCode.getMessage());  // ErrorCode에서 메시지 가져옴
        this.errorCode = errorCode;
    }

    public DuplicateEmailException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }
}
```

**변경 사항**:
- `ErrorCode` 필드 추가
- 생성자가 `String message` 대신 `ErrorCode`를 받음
- `getMessage()`는 ErrorCode에서 가져옴

**적용한 Exception들**:
- `DuplicateEmailException`
- `AuthenticationException`
- `AccountInactiveException`
- `UserNotFoundException`

### 3. AuthService 수정

**Before**:
```java
@Transactional
public User signup(String email, String password, String username) {
    if (userRepository.existsByEmail(email)) {
        throw new DuplicateEmailException("이미 존재하는 이메일입니다: " + email);
    }
    // ...
}

@Transactional(readOnly = true)
public String login(String email, String password) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AuthenticationException("이메일 또는 비밀번호가 일치하지 않습니다."));

    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new AuthenticationException("이메일 또는 비밀번호가 일치하지 않습니다.");
    }

    if (!user.getIsActive()) {
        throw new AccountInactiveException("비활성화된 계정입니다.");
    }
    // ...
}
```

**After**:
```java
@Transactional
public User signup(String email, String password, String username) {
    if (userRepository.existsByEmail(email)) {
        throw new DuplicateEmailException(ErrorCode.DUPLICATE_EMAIL);  // ← ErrorCode 사용
    }
    // ...
}

@Transactional(readOnly = true)
public String login(String email, String password) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AuthenticationException(ErrorCode.INVALID_CREDENTIALS));

    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new AuthenticationException(ErrorCode.INVALID_CREDENTIALS);
    }

    if (!user.getIsActive()) {
        throw new AccountInactiveException(ErrorCode.ACCOUNT_INACTIVE);
    }
    // ...
}
```

**개선점**:
- 메시지를 직접 작성하지 않음 → ErrorCode에서 관리
- 오타 가능성 제거
- IDE 자동완성으로 사용 가능한 에러 코드 확인 가능

### 4. GlobalExceptionHandler 수정

**Before**:
```java
@ExceptionHandler(DuplicateEmailException.class)
public ResponseEntity<ErrorResponse> handleDuplicateEmailException(
        DuplicateEmailException e,
        HttpServletRequest request
) {
    ErrorResponse errorResponse = ErrorResponse.of(
            "DUPLICATE_EMAIL",  // ← 매직 스트링
            e.getMessage(),
            request.getRequestURI()
    );

    return ResponseEntity
            .status(HttpStatus.CONFLICT)  // ← 하드코딩
            .body(errorResponse);
}
```

**After**:
```java
@ExceptionHandler(DuplicateEmailException.class)
public ResponseEntity<ErrorResponse> handleDuplicateEmailException(
        DuplicateEmailException e,
        HttpServletRequest request
) {
    ErrorResponse errorResponse = ErrorResponse.of(
            e.getErrorCode().getCode(),      // ← ErrorCode에서 가져옴
            e.getMessage(),
            request.getRequestURI()
    );

    return ResponseEntity
            .status(e.getErrorCode().getHttpStatus())  // ← ErrorCode에서 가져옴
            .body(errorResponse);
}
```

**개선점**:
- 에러 코드를 Exception 객체에서 가져옴
- HTTP 상태 코드도 ErrorCode에서 관리
- 일관성 보장

## 장점 비교

### 1. 컴파일 타임 안정성

**Before**:
```java
ErrorResponse.of("DUPLICATE_EMAIL", ...)   // ✅ OK
ErrorResponse.of("DUPLICAT_EMAIL", ...)    // ❌ 오타인데 컴파일 통과!
ErrorResponse.of("duplicate_email", ...)   // ❌ 대소문자 틀려도 통과!
```

**After**:
```java
throw new DuplicateEmailException(ErrorCode.DUPLICATE_EMAIL);  // ✅ IDE 자동완성
throw new DuplicateEmailException(ErrorCode.DUPLICAT_EMAIL);   // ❌ 컴파일 에러!
```

### 2. 중앙화된 관리

**Before**:
```
AuthService.java:         "이미 존재하는 이메일입니다"
GlobalExceptionHandler:   "DUPLICATE_EMAIL"
HTTP Status:              HttpStatus.CONFLICT
→ 3곳에 흩어져 있음
```

**After**:
```
ErrorCode.java:
DUPLICATE_EMAIL("DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다", HttpStatus.CONFLICT)
→ 한 곳에서 모두 관리
```

### 3. 재사용성

**Before**:
```java
// 프론트엔드 개발자: "에러 코드 목록이 어디 있나요?"
// 백엔드 개발자: "코드 전체 검색해야 해요..."
```

**After**:
```java
// ErrorCode.java 파일 하나만 보면 됨
public enum ErrorCode {
    DUPLICATE_EMAIL(...),
    INVALID_CREDENTIALS(...),
    ACCOUNT_INACTIVE(...),
    // ...
}
```

### 4. 유지보수

**Before - 에러 메시지 변경 시**:
```java
// 1. AuthService에서 메시지 변경
throw new DuplicateEmailException("이미 사용 중인 이메일입니다");  // 변경

// 2. 다른 Service에서도 찾아서 변경
throw new DuplicateEmailException("이미 사용 중인 이메일입니다");  // 변경

// 3. 놓친 곳이 있을 수 있음
throw new DuplicateEmailException("이미 존재하는 이메일입니다");  // ← 놓침!
```

**After - 에러 메시지 변경 시**:
```java
// ErrorCode.java에서 한 곳만 변경
DUPLICATE_EMAIL("DUPLICATE_EMAIL", "새로운 메시지", HttpStatus.CONFLICT)
// ↓
// 전체 코드에 자동 반영됨!
```

## 실제 사용 예시

### 비즈니스 로직에서 사용

```java
// 회원가입
if (userRepository.existsByEmail(email)) {
    throw new DuplicateEmailException(ErrorCode.DUPLICATE_EMAIL);
}

// 로그인
User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new AuthenticationException(ErrorCode.INVALID_CREDENTIALS));

if (!passwordEncoder.matches(password, user.getPassword())) {
    throw new AuthenticationException(ErrorCode.INVALID_CREDENTIALS);
}

if (!user.getIsActive()) {
    throw new AccountInactiveException(ErrorCode.ACCOUNT_INACTIVE);
}

// 사용자 조회
return userRepository.findByEmail(email)
        .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
```

### 실제 응답 예시

**요청**: 중복된 이메일로 회원가입
```json
POST /api/auth/signup
{
  "email": "test@test.com",
  "password": "password123",
  "username": "테스터"
}
```

**응답**: 409 Conflict
```json
{
  "errorCode": "DUPLICATE_EMAIL",
  "message": "이미 사용 중인 이메일입니다",
  "timestamp": "2026-03-22T14:30:00",
  "path": "/api/auth/signup"
}
```

## 명시성 vs 생산성 트레이드오프

### 코드량 비교

**매직 스트링 방식** (빠르지만 위험):
```java
throw new DuplicateEmailException("중복");
// 1줄, 10초 작성
```

**ErrorCode Enum 방식** (느리지만 안전):
```java
// 1. ErrorCode 정의
DUPLICATE_EMAIL("DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다", HttpStatus.CONFLICT)

// 2. Exception 수정
private final ErrorCode errorCode;
public DuplicateEmailException(ErrorCode errorCode) { ... }

// 3. 사용
throw new DuplicateEmailException(ErrorCode.DUPLICATE_EMAIL);

// 총 15줄, 5분 작성
```

### 결과

- **초기 작성 시간**: 5배 증가
- **버그 가능성**: 1/10로 감소
- **유지보수성**: 10배 향상
- **협업 효율성**: 크게 향상 (에러 코드 목록 공유 쉬움)

## 결론

**ErrorCode Enum 도입으로 얻은 것**:
- ✅ 컴파일 타임 안전성 (오타 방지)
- ✅ 중앙화된 에러 관리
- ✅ HTTP 상태 코드 일관성
- ✅ 프론트엔드와의 협업 용이
- ✅ 유지보수성 향상

**대가**:
- ⚠️ 초기 구현 시간 증가
- ⚠️ 코드량 증가

**언제 사용할까?**:
- ✅ 팀 프로젝트
- ✅ 장기 유지보수 예상
- ✅ 포트폴리오 (기술력 어필)
- ❌ 빠른 프로토타입 (매직 스트링도 OK)

**프로젝트 선택**: 학습 + 포트폴리오 목적이므로 **ErrorCode Enum 방식 채택** ✅
