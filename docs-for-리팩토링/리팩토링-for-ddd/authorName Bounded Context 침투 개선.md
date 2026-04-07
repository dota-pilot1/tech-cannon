# `authorName` Bounded Context 침투 개선

> 상태: ✅ 리팩토링 완료
> 대상 도메인: `task`, `wiki`
> 변경 파일 수: 17개

---

## 문제 원인

`task`, `wiki` 도메인 객체에 `user` 컨텍스트의 데이터(`authorName`)가 직접 존재했다.

```java
// 변경 전 — task/domain/TaskPost.java
private Long authorId;
private String authorName;   // ← user 컨텍스트 데이터가 task 도메인 안에 존재

// 변경 전 — task/domain/TaskComment.java
private String authorName;

// 변경 전 — wiki/domain/WikiPost.java
private String authorName;
```

---

## 왜 문제인가

### 1. Bounded Context 경계가 깨진다

DDD에서 각 도메인은 자신의 경계(Bounded Context) 안에서만 책임을 진다.
`task` 도메인 객체가 `user` 컨텍스트의 데이터(`authorName`)를 직접 보유하면
도메인 간 경계가 무너진다.

```
user 컨텍스트          task 컨텍스트
┌──────────┐          ┌──────────────────────┐
│  User    │          │  TaskPost            │
│  - id    │          │  - id                │
│  - name  │   ←침투  │  - authorId          │
└──────────┘          │  - authorName   ← ❌ │
                      └──────────────────────┘
```

### 2. 도메인 객체의 책임이 섞인다

`TaskPost`는 "게시글" 데이터만 책임져야 한다.
`authorName`은 조회용 표시 데이터로, 도메인 핵심 로직과 무관하다.
도메인 객체에 조회용 필드가 섞이면 단일 책임 원칙(SRP)이 깨진다.

### 3. 도메인 객체 변경이 user 도메인에 의존된다

`user`의 이름 필드가 바뀌거나, 표시 방식이 달라지면
`task`, `wiki` 도메인 객체도 영향을 받는다.

---

## 개선 내용

### 핵심 전략

MyBatis가 도메인 객체 대신 **Response DTO에 직접 매핑**하도록 변경한다.
도메인 객체는 ID 참조(`authorId`)만 보유하고,
`authorName`은 조회 시 JOIN 결과를 Response DTO에 담는다.

```
변경 전:
  MyBatis JOIN → TaskPost(authorId + authorName) → Controller

변경 후:
  MyBatis JOIN → TaskPostSummary(authorId + authorName) → Controller
                 (Response DTO에 직접 매핑)
  도메인 TaskPost → authorId만 보유
```

---

### Step 1 — 도메인 객체에서 authorName 제거

```java
// 변경 후 — task/domain/TaskPost.java
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class TaskPost {
    private Long id;
    private Long folderId;
    private String title;
    private Long authorId;       // ✅ ID 참조만 보유
    // authorName 제거
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private List<TaskBlock> blocks;
}
```

`TaskComment`, `WikiPost` 동일하게 적용.

---

### Step 2 — MyBatis ResultMap type을 도메인 객체 → Response DTO로 교체

```xml
<!-- 변경 전 — TaskPostMapper.xml -->
<resultMap id="TaskPostResultMap" type="com.mapo.palantier.task.domain.TaskPost">
    <result property="authorName" column="author_name"/>
    ...
</resultMap>

<!-- 변경 후 — TaskPostMapper.xml -->
<resultMap id="TaskPostSummaryResultMap" type="com.mapo.palantier.task.presentation.dto.TaskPostSummary">
    <result property="authorName" column="author_name"/>  <!-- DTO에 직접 매핑 -->
    ...
</resultMap>

<resultMap id="TaskPostDetailResultMap" type="com.mapo.palantier.task.presentation.dto.TaskPostDetail">
    <result property="authorName" column="author_name"/>
    ...
</resultMap>
```

SQL 쿼리의 `JOIN users u ON ... u.username as author_name`은 그대로 유지.
매핑 대상만 도메인 객체 → Response DTO로 변경.

---

### Step 3 — Mapper 인터페이스 반환 타입 변경

```java
// 변경 전
@Mapper
public interface TaskPostMapper {
    List<TaskPost> findAll();
    Optional<TaskPost> findByIdWithBlocks(@Param("id") Long id);
    ...
}

// 변경 후
@Mapper
public interface TaskPostMapper {
    List<TaskPostSummary> findAll();           // ✅ DTO 직접 반환
    Optional<TaskPostDetail> findByIdWithBlocks(@Param("id") Long id);
    void insert(TaskPost post);               // ✅ 쓰기는 도메인 객체 유지
    void update(TaskPost post);
}
```

쓰기(`insert`, `update`)는 도메인 객체를 그대로 사용한다.
읽기(`find*`)만 Response DTO를 반환하도록 변경한다.

---

### Step 4 — 연쇄 반환 타입 변경

Mapper 반환 타입이 바뀌면서 아래 레이어들도 연쇄적으로 교체했다.

```
TaskPostMapper          → List<TaskPostSummary>
    ↓
TaskPostRepositoryImpl  → List<TaskPostSummary>
    ↓
TaskPostRepository      → List<TaskPostSummary>  (도메인 인터페이스)
    ↓
TaskPostService         → List<TaskPostSummary>
    ↓
TaskPostController      → from() 변환 코드 제거 (이미 DTO이므로 불필요)
```

---

### Step 5 — Response DTO에서 from() 메서드 제거

기존 `from(TaskPost post)` 메서드는 도메인 객체에서 필드를 복사하는 역할이었다.
MyBatis가 직접 DTO에 매핑하므로 이 메서드가 불필요해졌다.

```java
// 변경 전 — TaskPostSummary.java
public static TaskPostSummary from(TaskPost post) {
    return TaskPostSummary.builder()
        .authorName(post.getAuthorName())  // ← 이제 존재하지 않는 필드
        ...
}

// 변경 후 — from() 메서드 전체 제거
// MyBatis가 ResultMap으로 직접 TaskPostSummary를 생성함
```

---

## 변경 파일 목록

| 파일 | 변경 유형 | 내용 |
|------|---------|------|
| `task/domain/TaskPost.java` | 수정 | `authorName` 필드 제거 |
| `task/domain/TaskComment.java` | 수정 | `authorName` 필드 제거 |
| `wiki/domain/WikiPost.java` | 수정 | `authorName` 필드 제거 |
| `task/domain/TaskPostRepository.java` | 수정 | 조회 반환 타입 → `TaskPostSummary` / `TaskPostDetail` |
| `task/domain/TaskCommentRepository.java` | 수정 | 반환 타입 → `TaskCommentResponse` |
| `wiki/domain/WikiPostRepository.java` | 수정 | 반환 타입 → `WikiPostSummary` / `WikiPostDetail` |
| `task/infrastructure/TaskPostMapper.java` | 수정 | 반환 타입 → DTO |
| `task/infrastructure/TaskPostRepositoryImpl.java` | 수정 | 반환 타입 → DTO |
| `task/infrastructure/TaskCommentMapper.java` | 수정 | 반환 타입 → DTO |
| `task/infrastructure/TaskCommentRepositoryImpl.java` | 수정 | 반환 타입 → DTO |
| `wiki/infrastructure/WikiPostMapper.java` | 수정 | 반환 타입 → DTO |
| `wiki/infrastructure/WikiPostRepositoryImpl.java` | 수정 | 반환 타입 → DTO |
| `task/application/TaskPostService.java` | 수정 | 반환 타입 → DTO |
| `task/application/TaskCommentService.java` | 수정 | 반환 타입 → DTO |
| `wiki/application/WikiPostService.java` | 수정 | 반환 타입 → DTO |
| `task/presentation/TaskPostController.java` | 수정 | `from()` 변환 제거 |
| `task/presentation/TaskCommentController.java` | 수정 | `from()` 변환 제거 |
| `wiki/presentation/WikiPostController.java` | 수정 | `from()` 변환 제거 |
| `task/presentation/dto/TaskPostSummary.java` | 수정 | `from()` 메서드 제거 |
| `task/presentation/dto/TaskPostDetail.java` | 수정 | `from()` 메서드 제거 |
| `task/presentation/dto/TaskCommentResponse.java` | 수정 | `from()` 메서드 제거 |
| `wiki/presentation/dto/WikiPostSummary.java` | 수정 | `from()` 메서드 제거 |
| `wiki/presentation/dto/WikiPostDetail.java` | 수정 | `from()` 메서드 제거 |
| `mybatis/mapper/TaskPostMapper.xml` | 수정 | ResultMap type → `TaskPostSummary` / `TaskPostDetail` |
| `mybatis/mapper/TaskCommentMapper.xml` | 수정 | ResultMap type → `TaskCommentResponse` |
| `mybatis/mapper/WikiPostMapper.xml` | 수정 | ResultMap type → `WikiPostSummary` / `WikiPostDetail` |

---

## 완료 체크리스트

- [x] `TaskPost.authorName` 제거
- [x] `TaskComment.authorName` 제거
- [x] `WikiPost.authorName` 제거
- [x] `TaskPostMapper.xml` ResultMap → DTO 교체
- [x] `TaskCommentMapper.xml` ResultMap → DTO 교체
- [x] `WikiPostMapper.xml` ResultMap → DTO 교체
- [x] Mapper / Repository / Service / Controller 반환 타입 연쇄 교체
- [x] Response DTO `from()` 메서드 제거
- [x] 빌드 성공 확인 (`BUILD SUCCESSFUL`)

---

## 이 패턴을 새 도메인에 적용할 때

도메인 간 데이터가 필요한 경우 아래 원칙을 따른다.

| 상황 | 방법 |
|------|------|
| 다른 컨텍스트의 ID가 필요 | 도메인 객체에 ID만 보유 (`authorId`) |
| 다른 컨텍스트의 표시용 데이터 필요 | MyBatis JOIN 후 Response DTO에 직접 매핑 |
| 도메인 객체 → DTO 변환 | `from()` 메서드 없이 MyBatis가 직접 생성 |