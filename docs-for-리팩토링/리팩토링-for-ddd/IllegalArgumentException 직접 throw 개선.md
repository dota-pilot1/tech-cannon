# `IllegalArgumentException` 직접 throw 개선

> 상태: ✅ 리팩토링 완료
> 대상 도메인: `task`, `wiki`
> 변경 파일 수: 7개

---

## 문제 원인

`task`, `wiki` 도메인의 Service에서 리소스를 찾지 못할 때
공통 예외 인프라(`ErrorCode`, `GlobalExceptionHandler`)를 사용하지 않고
`IllegalArgumentException`을 직접 throw하고 있었다.

```java
// 변경 전 — task/application/TaskPostService.java
.orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id));

// 변경 전 — task/application/TaskFolderService.java
.orElseThrow(() -> new IllegalArgumentException("폴더를 찾을 수 없습니다: " + id));

// 변경 전 — wiki/application/WikiPostService.java
.orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + id));

// 변경 전 — wiki/application/WikiFolderService.java
.orElseThrow(() -> new IllegalArgumentException("폴더를 찾을 수 없습니다: " + id));
```

---

## 왜 문제인가

### 1. HTTP 상태 코드가 틀리다

`IllegalArgumentException`은 `GlobalExceptionHandler`에서 **400 Bad Request**로 처리된다.
리소스가 없는 상황은 **404 Not Found**가 맞다.

| 상황 | 변경 전 응답 | 변경 후 응답 |
|------|------------|------------|
| 없는 게시글 ID로 조회 | `400 INVALID_ARGUMENT` | `404 TASK_POST_NOT_FOUND` |
| 없는 폴더 ID로 조회 | `400 INVALID_ARGUMENT` | `404 TASK_FOLDER_NOT_FOUND` |
| 없는 문서 ID로 조회 | `400 INVALID_ARGUMENT` | `404 WIKI_POST_NOT_FOUND` |

### 2. 에러 코드가 의미 없다

클라이언트가 `INVALID_ARGUMENT`를 받으면 "내가 잘못된 값을 보낸 건가?" 로 오해한다.
실제로는 서버에 해당 리소스가 없는 상황인데 잘못된 신호를 준다.

### 3. 이미 만들어진 공통 예외 구조를 활용하지 않는다

`user` 도메인은 이미 `UserNotFoundException`, `ErrorCode`, `GlobalExceptionHandler`로
올바르게 처리하고 있었다.
`task`, `wiki`만 이 구조를 따르지 않고 있었다.

### 4. 어느 도메인 문제인지 알 수 없다

`IllegalArgumentException("게시글을 찾을 수 없습니다: " + id)` 는
로그에서 봤을 때 어느 도메인의 어느 리소스인지 에러 코드로 구분할 수 없다.

---

## 개선 내용

### Step 1 — `ErrorCode`에 리소스별 404 코드 추가

```java
// common/exception/ErrorCode.java
// 리소스 관련 (404)
TASK_POST_NOT_FOUND(
    "TASK_POST_NOT_FOUND",
    "게시글을 찾을 수 없습니다",
    HttpStatus.NOT_FOUND
),
TASK_FOLDER_NOT_FOUND(
    "TASK_FOLDER_NOT_FOUND",
    "폴더를 찾을 수 없습니다",
    HttpStatus.NOT_FOUND
),
TASK_COMMENT_NOT_FOUND(
    "TASK_COMMENT_NOT_FOUND",
    "댓글을 찾을 수 없습니다",
    HttpStatus.NOT_FOUND
),
WIKI_POST_NOT_FOUND(
    "WIKI_POST_NOT_FOUND",
    "문서를 찾을 수 없습니다",
    HttpStatus.NOT_FOUND
),
WIKI_FOLDER_NOT_FOUND(
    "WIKI_FOLDER_NOT_FOUND",
    "폴더를 찾을 수 없습니다",
    HttpStatus.NOT_FOUND
),
```

### Step 2 — `ResourceNotFoundException` 공통 예외 클래스 신규 생성

`UserNotFoundException`과 동일한 패턴으로 생성한다.
리소스 종류에 관계없이 하나의 예외 클래스에서 `ErrorCode`로 구분한다.

```java
// common/exception/ResourceNotFoundException.java
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
```

### Step 3 — `GlobalExceptionHandler`에 핸들러 추가

```java
// common/exception/GlobalExceptionHandler.java
@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
    ResourceNotFoundException e,
    HttpServletRequest request
) {
    log.warn(
        "Resource not found: {} - Path: {}",
        e.getMessage(),
        request.getRequestURI()
    );

    ErrorResponse errorResponse = ErrorResponse.of(
        e.getErrorCode().getCode(),
        e.getMessage(),
        request.getRequestURI()
    );

    return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(
        errorResponse
    );
}
```

### Step 4 — Service 4개 파일 교체

```java
// 변경 후 — TaskPostService.java
.orElseThrow(() ->
    new ResourceNotFoundException(ErrorCode.TASK_POST_NOT_FOUND)
);

// 변경 후 — TaskFolderService.java
.orElseThrow(() ->
    new ResourceNotFoundException(ErrorCode.TASK_FOLDER_NOT_FOUND)
);

// 변경 후 — WikiPostService.java
.orElseThrow(() ->
    new ResourceNotFoundException(ErrorCode.WIKI_POST_NOT_FOUND)
);

// 변경 후 — WikiFolderService.java
.orElseThrow(() ->
    new ResourceNotFoundException(ErrorCode.WIKI_FOLDER_NOT_FOUND)
);
```

---

## 변경된 파일 목록

| 파일 | 변경 유형 | 내용 |
|------|---------|------|
| `common/exception/ErrorCode.java` | 수정 | 5개 에러 코드 추가 |
| `common/exception/ResourceNotFoundException.java` | **신규 생성** | 공통 리소스 예외 클래스 |
| `common/exception/GlobalExceptionHandler.java` | 수정 | `ResourceNotFoundException` 핸들러 추가 |
| `task/application/TaskPostService.java` | 수정 | `IllegalArgumentException` → `ResourceNotFoundException` |
| `task/application/TaskFolderService.java` | 수정 | `IllegalArgumentException` → `ResourceNotFoundException` |
| `wiki/application/WikiPostService.java` | 수정 | `IllegalArgumentException` → `ResourceNotFoundException` |
| `wiki/application/WikiFolderService.java` | 수정 | `IllegalArgumentException` → `ResourceNotFoundException` |

---

## 완료 체크리스트

- [x] `ErrorCode`에 5개 코드 추가
- [x] `ResourceNotFoundException.java` 생성
- [x] `GlobalExceptionHandler`에 핸들러 추가
- [x] `TaskPostService` 교체
- [x] `TaskFolderService` 교체
- [x] `WikiPostService` 교체
- [x] `WikiFolderService` 교체
- [x] 빌드 성공 확인 (`BUILD SUCCESSFUL`)

---

## 이 패턴을 새 도메인에 적용할 때

새 도메인을 추가하거나 기존 도메인에 새 리소스가 생기면 아래 순서를 따른다.

1. `ErrorCode`에 `{DOMAIN}_{RESOURCE}_NOT_FOUND` 형식으로 코드 추가
2. Service에서 `orElseThrow` 시 `ResourceNotFoundException(ErrorCode.XXX_NOT_FOUND)` 사용
3. `GlobalExceptionHandler`는 이미 `ResourceNotFoundException`을 처리하므로 **추가 작업 없음**