# Response DTO 미분리 개선

> 상태: ✅ 리팩토링 완료
> 대상 도메인: `task`, `wiki`
> 변경 파일 수: 약 20개

---

## 문제 원인

`task`, `wiki` 도메인의 Controller가 도메인 객체를 그대로 응답으로 반환하고 있다.

```java
// task/presentation/TaskPostController.java — 현재 코드
public ResponseEntity<List<TaskPost>> getPostsByFolder(...) { ... }
public ResponseEntity<TaskPost> getPost(@PathVariable Long id) { ... }

// task/presentation/TaskFolderController.java — 현재 코드
public ResponseEntity<List<TaskFolder>> getAllFolders() { ... }
public ResponseEntity<TaskFolder> getFolder(@PathVariable Long id) { ... }

// task/presentation/TaskCommentController.java — 현재 코드
public ResponseEntity<List<TaskComment>> getComments(...) { ... }

// wiki/presentation/WikiPostController.java — 현재 코드
public ResponseEntity<List<WikiPost>> getPosts(...) { ... }
public ResponseEntity<WikiPost> getPost(@PathVariable Long id) { ... }

// wiki/presentation/WikiFolderController.java — 현재 코드
public ResponseEntity<List<WikiFolder>> getAllFolders() { ... }
```

---

## 왜 문제인가

### 1. 클라이언트에 불필요한 필드가 노출된다

도메인 객체의 모든 필드가 JSON으로 직렬화되어 응답에 포함된다.
클라이언트가 알 필요 없는 내부 필드까지 노출된다.

| 도메인 객체 | 노출되면 안 되는 필드 |
|------------|-------------------|
| `TaskPost` | `authorId`, `deletedAt` |
| `TaskFolder` | `createdBy`, `deletedAt` |
| `TaskComment` | `authorId`, `deletedAt` |
| `WikiPost` | `authorId`, `deletedAt` |
| `WikiFolder` | `createdBy`, `deletedAt` |

### 2. 도메인 내부 변경이 API 스펙 변경으로 이어진다

도메인 객체에 필드를 추가/삭제/이름변경하면
그 즉시 API 응답 스펙이 바뀐다.
클라이언트 코드가 깨질 수 있다.

```java
// TaskPost에 내부 처리용 필드를 추가하는 순간
private String internalNote;  // ← 의도치 않게 API 응답에 포함됨
```

### 3. 목록 응답과 상세 응답이 같은 타입이다

목록 조회(`List<TaskPost>`)와 상세 조회(`TaskPost`)가 동일한 타입을 사용한다.
목록에서는 `blocks` 같은 무거운 필드가 필요 없는데 항상 포함된다.

```java
// 목록 조회인데 blocks 필드가 null로 포함되어 응답됨
public ResponseEntity<List<TaskPost>> getPostsByFolder(...)

// 상세 조회에서만 blocks가 실제 데이터로 채워짐
public ResponseEntity<TaskPost> getPost(@PathVariable Long id)
```

### 4. `authorName`이 도메인 객체 안에 존재하는 이유가 사라진다

현재 도메인 객체에 `authorName`이 있는 이유는
클라이언트에 응답할 때 이름을 보여줘야 하기 때문이다.
Response DTO를 분리하면 `authorName`을 도메인 객체에서 꺼낼 수 있다.
(문제 4 — Bounded Context 침투 해결과 연결됨)

---

## 개선 내용

### 만들 Response DTO 목록

#### `task` 도메인

```
task/presentation/dto/
├── (기존) TaskPostRequest.java
├── (기존) TaskBlockRequest.java
├── (기존) TaskFolderRequest.java
├── (기존) TaskCommentRequest.java
├── (신규) TaskPostSummary.java      ← 목록 조회용
├── (신규) TaskPostDetail.java       ← 상세 조회용 (blocks 포함)
├── (신규) TaskFolderResponse.java   ← 폴더 목록/상세 공통
└── (신규) TaskCommentResponse.java  ← 댓글 목록용
```

#### `wiki` 도메인

```
wiki/presentation/dto/
├── (기존) WikiPostRequest.java
├── (기존) WikiBlockRequest.java
├── (기존) WikiFolderRequest.java
├── (신규) WikiPostSummary.java      ← 목록 조회용
├── (신규) WikiPostDetail.java       ← 상세 조회용 (blocks 포함)
├── (신규) WikiFolderResponse.java   ← 폴더 목록/상세 공통
└── (신규) WikiBlockResponse.java    ← 블록 응답용 (상세 조회에 포함)
```

---

### 각 DTO 필드 설계

#### `TaskPostSummary` — 목록 조회용

```java
// 클라이언트가 목록에서 필요한 것만
@Getter
@Builder
public class TaskPostSummary {
    private Long id;
    private Long folderId;
    private String title;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaskPostSummary from(TaskPost post) {
        return TaskPostSummary.builder()
                .id(post.getId())
                .folderId(post.getFolderId())
                .title(post.getTitle())
                .authorName(post.getAuthorName())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
```

#### `TaskPostDetail` — 상세 조회용

```java
// 블록까지 포함한 상세 응답
@Getter
@Builder
public class TaskPostDetail {
    private Long id;
    private Long folderId;
    private String title;
    private String authorName;
    private List<TaskBlock> blocks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaskPostDetail from(TaskPost post) {
        return TaskPostDetail.builder()
                .id(post.getId())
                .folderId(post.getFolderId())
                .title(post.getTitle())
                .authorName(post.getAuthorName())
                .blocks(post.getBlocks())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
```

#### `TaskFolderResponse` — 폴더 응답용

```java
@Getter
@Builder
public class TaskFolderResponse {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
    private LocalDateTime createdAt;

    public static TaskFolderResponse from(TaskFolder folder) {
        return TaskFolderResponse.builder()
                .id(folder.getId())
                .parentId(folder.getParentId())
                .name(folder.getName())
                .sortOrder(folder.getSortOrder())
                .createdAt(folder.getCreatedAt())
                .build();
    }
}
```

#### `TaskCommentResponse` — 댓글 응답용

```java
@Getter
@Builder
public class TaskCommentResponse {
    private Long id;
    private Long postId;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;

    public static TaskCommentResponse from(TaskComment comment) {
        return TaskCommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .authorName(comment.getAuthorName())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
```

---

### Controller 변경 방향

```java
// ❌ 변경 전 — 도메인 객체 직접 반환
public ResponseEntity<List<TaskPost>> getPostsByFolder(...) {
    return ResponseEntity.ok(taskPostService.getAllPosts());
}

public ResponseEntity<TaskPost> getPost(@PathVariable Long id) {
    return ResponseEntity.ok(taskPostService.getPostWithBlocks(id));
}

// ✅ 변경 후 — Response DTO로 변환 후 반환
public ResponseEntity<List<TaskPostSummary>> getPostsByFolder(...) {
    return ResponseEntity.ok(
        taskPostService.getAllPosts().stream()
            .map(TaskPostSummary::from)
            .toList()
    );
}

public ResponseEntity<TaskPostDetail> getPost(@PathVariable Long id) {
    return ResponseEntity.ok(
        TaskPostDetail.from(taskPostService.getPostWithBlocks(id))
    );
}
```

---

### 도메인 객체에서 `authorName` 제거 (문제 4 연계)

Response DTO 분리가 완료되면 도메인 객체에서 `authorName`을 제거할 수 있다.

```java
// 변경 전 — TaskPost 도메인 객체
private String authorName;   // ← user 컨텍스트 데이터

// 변경 후 — TaskPost 도메인 객체에서 제거
// authorName은 MyBatis JOIN 결과를 TaskPostSummary/TaskPostDetail에 직접 매핑
```

MyBatis ResultMap도 함께 수정이 필요하다.

---

## 변경 파일 목록

| 파일 | 변경 유형 | 내용 |
|------|---------|------|
| `task/presentation/dto/TaskPostSummary.java` | 신규 생성 | 게시글 목록 응답 DTO |
| `task/presentation/dto/TaskPostDetail.java` | 신규 생성 | 게시글 상세 응답 DTO |
| `task/presentation/dto/TaskFolderResponse.java` | 신규 생성 | 폴더 응답 DTO |
| `task/presentation/dto/TaskCommentResponse.java` | 신규 생성 | 댓글 응답 DTO |
| `wiki/presentation/dto/WikiPostSummary.java` | 신규 생성 | 문서 목록 응답 DTO |
| `wiki/presentation/dto/WikiPostDetail.java` | 신규 생성 | 문서 상세 응답 DTO |
| `wiki/presentation/dto/WikiFolderResponse.java` | 신규 생성 | 폴더 응답 DTO |
| `wiki/presentation/dto/WikiBlockResponse.java` | 신규 생성 | 블록 응답 DTO |
| `task/presentation/TaskPostController.java` | 수정 | 반환 타입 → Response DTO |
| `task/presentation/TaskFolderController.java` | 수정 | 반환 타입 → Response DTO |
| `task/presentation/TaskCommentController.java` | 수정 | 반환 타입 → Response DTO |
| `wiki/presentation/WikiPostController.java` | 수정 | 반환 타입 → Response DTO |
| `wiki/presentation/WikiFolderController.java` | 수정 | 반환 타입 → Response DTO |
| `task/domain/TaskPost.java` | 수정 | `authorName` 필드 제거 (문제 4 연계) |
| `task/domain/TaskComment.java` | 수정 | `authorName` 필드 제거 (문제 4 연계) |
| `wiki/domain/WikiPost.java` | 수정 | `authorName` 필드 제거 (문제 4 연계) |
| `mybatis/mapper/task/*.xml` | 수정 | ResultMap 경로 변경 (authorName 제거 시) |
| `mybatis/mapper/wiki/*.xml` | 수정 | ResultMap 경로 변경 (authorName 제거 시) |

---

## 완료 체크리스트

### task Response DTO 생성
- [x] `TaskPostSummary.java` 생성
- [x] `TaskPostDetail.java` 생성
- [x] `TaskFolderResponse.java` 생성
- [x] `TaskCommentResponse.java` 생성

### wiki Response DTO 생성
- [x] `WikiPostSummary.java` 생성
- [x] `WikiPostDetail.java` 생성
- [x] `WikiFolderResponse.java` 생성
- [x] `WikiBlockResponse.java` 생성

### Controller 반환 타입 교체
- [x] `TaskPostController` 교체
- [x] `TaskFolderController` 교체
- [x] `TaskCommentController` 교체
- [x] `WikiPostController` 교체
- [x] `WikiFolderController` 교체

### 도메인 객체 정리 (문제 4 연계)
- [x] `TaskPost.authorName` 제거 + MyBatis ResultMap → `TaskPostSummaryResultMap` / `TaskPostDetailResultMap` 으로 교체
- [x] `TaskComment.authorName` 제거 + MyBatis ResultMap → `TaskCommentResponseResultMap` 으로 교체
- [x] `WikiPost.authorName` 제거 + MyBatis ResultMap → `WikiPostSummaryResultMap` / `WikiPostDetailResultMap` 으로 교체

### 최종 확인
- [x] 빌드 성공 확인 (`BUILD SUCCESSFUL`)
- [x] `from()` 메서드 및 도메인 객체 import 제거 (MyBatis 직접 매핑으로 불필요해짐)
- [ ] 프론트엔드 API 응답 필드 확인 (필드명 변경 없는지)

---

## 주의사항

### 프론트엔드 영향도 확인 필수

Response DTO 분리 시 응답 필드 중 `authorId`, `deletedAt` 등을
프론트엔드에서 사용 중이라면 제거 시 화면이 깨질 수 있다.
작업 전 프론트엔드 코드에서 해당 필드 사용 여부를 먼저 확인한다.

### MyBatis ResultMap 수정 범위

`authorName` 필드를 도메인 객체에서 제거하면
MyBatis XML의 `<resultMap>`에서 해당 매핑도 함께 제거해야 한다.
빌드는 성공해도 런타임에 매핑 오류가 날 수 있으므로 API 테스트 필수.

### 작업 순서 권장

한 도메인씩 완료 후 빌드 확인하며 진행한다.
`task` 전체 완료 → 빌드 확인 → `wiki` 진행

---

## 참고 — 새 도메인에 적용할 때

응답 용도에 따라 DTO를 분리하는 기준:

| 상황 | DTO |
|------|-----|
| 목록 조회 | `XxxSummary` — 가벼운 필드만 |
| 상세 조회 | `XxxDetail` — 연관 데이터 포함 |
| 단순 단건 조회 | `XxxResponse` — 하나로 통일 가능 |