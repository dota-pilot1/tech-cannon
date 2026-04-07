# `task`, `wiki` 도메인 레이어 분리 리팩토링 계획

> 목표: 현재 절차적 구조로 되어있는 `task`, `wiki` 도메인을 DDD 4계층 아키텍처로 재편
> 참고 기준 도메인: `user`, `authority`, `workspace` (현재 프로젝트 내 잘 된 사례)

---

## 1. 현재 구조 (AS-IS)

### `task` 도메인
```
task/
├── block/
│   ├── BlockType.java          (Enum)
│   ├── TaskBlock.java          (@Data POJO - 도메인 로직 없음)
│   └── TaskBlockMapper.java    (@Mapper - Infrastructure가 여기 노출)
├── comment/
│   ├── TaskComment.java        (@Data POJO)
│   ├── TaskCommentMapper.java  (@Mapper)
│   ├── TaskCommentService.java (Mapper 직접 주입)
│   └── presentation/
│       └── TaskCommentController.java
├── dto/
│   ├── TaskBlockDto.java
│   ├── TaskCommentDto.java
│   ├── TaskFolderDto.java
│   └── TaskPostDto.java
├── folder/
│   ├── TaskFolder.java         (@Data POJO)
│   ├── TaskFolderMapper.java   (@Mapper)
│   ├── TaskFolderService.java  (Mapper 직접 주입)
│   └── presentation/
│       └── TaskFolderController.java
└── post/
    ├── TaskPost.java           (@Data POJO)
    ├── TaskPostMapper.java     (@Mapper)
    ├── TaskPostService.java    (Mapper 직접 주입 + 블록 저장 로직 혼재)
    └── presentation/
        └── TaskPostController.java
```

### `wiki` 도메인
```
wiki/
├── block/
│   ├── WikiBlock.java
│   ├── WikiBlockMapper.java
│   └── WikiBlockType.java
├── dto/
│   ├── WikiBlockDto.java
│   ├── WikiFolderDto.java
│   └── WikiPostDto.java
├── folder/
│   ├── WikiFolder.java
│   ├── WikiFolderMapper.java
│   ├── WikiFolderService.java  (Mapper 직접 주입)
│   └── presentation/
│       └── WikiFolderController.java
└── post/
    ├── WikiPost.java
    ├── WikiPostMapper.java
    ├── WikiPostService.java    (Mapper 직접 주입 + 블록 저장 로직 혼재)
    └── presentation/
        └── WikiPostController.java
```

### 핵심 문제점 정리

| 문제 | 설명 |
|------|------|
| Mapper 직접 주입 | Service가 MyBatis Mapper(@Mapper)를 직접 의존 → Infrastructure가 Application에 노출 |
| Repository 인터페이스 없음 | domain 레이어에 Repository 인터페이스가 없어 DIP 위반 |
| 레이어 폴더 없음 | `application/`, `domain/`, `infrastructure/` 폴더 자체가 없음 |
| 도메인 로직 없음 | `@Data` POJO로 데이터 구조체 역할만 함 (Anemic Domain Model) |
| DTO 위치 혼재 | `task/dto/`가 레이어 구분 없이 최상단에 위치 |

---

## 2. 목표 구조 (TO-BE)

### `task` 도메인
```
task/
├── application/
│   ├── TaskPostService.java        (Repository 인터페이스만 의존)
│   ├── TaskFolderService.java
│   └── TaskCommentService.java
├── domain/
│   ├── TaskPost.java               (@Getter + @Builder + 도메인 메서드)
│   ├── TaskBlock.java              (@Getter + @Builder)
│   ├── TaskFolder.java             (@Getter + @Builder)
│   ├── TaskComment.java            (@Getter + @Builder)
│   ├── BlockType.java              (Enum - 이동)
│   ├── TaskPostRepository.java     (인터페이스)
│   ├── TaskBlockRepository.java    (인터페이스)
│   ├── TaskFolderRepository.java   (인터페이스)
│   └── TaskCommentRepository.java  (인터페이스)
├── infrastructure/
│   ├── TaskPostMapper.java         (@Mapper - MyBatis)
│   ├── TaskBlockMapper.java        (@Mapper - MyBatis)
│   ├── TaskFolderMapper.java       (@Mapper - MyBatis)
│   ├── TaskCommentMapper.java      (@Mapper - MyBatis)
│   ├── TaskPostRepositoryImpl.java
│   ├── TaskBlockRepositoryImpl.java
│   ├── TaskFolderRepositoryImpl.java
│   └── TaskCommentRepositoryImpl.java
└── presentation/
    ├── TaskPostController.java
    ├── TaskFolderController.java
    ├── TaskCommentController.java
    └── dto/
        ├── TaskPostRequest.java
        ├── TaskPostResponse.java
        ├── TaskBlockRequest.java
        ├── TaskFolderRequest.java
        └── TaskCommentRequest.java
```

### `wiki` 도메인
```
wiki/
├── application/
│   ├── WikiPostService.java
│   └── WikiFolderService.java
├── domain/
│   ├── WikiPost.java
│   ├── WikiBlock.java
│   ├── WikiFolder.java
│   ├── WikiBlockType.java          (Enum - 이동)
│   ├── WikiPostRepository.java     (인터페이스)
│   ├── WikiBlockRepository.java    (인터페이스)
│   └── WikiFolderRepository.java   (인터페이스)
├── infrastructure/
│   ├── WikiPostMapper.java
│   ├── WikiBlockMapper.java
│   ├── WikiFolderMapper.java
│   ├── WikiPostRepositoryImpl.java
│   ├── WikiBlockRepositoryImpl.java
│   └── WikiFolderRepositoryImpl.java
└── presentation/
    ├── WikiPostController.java
    ├── WikiFolderController.java
    └── dto/
        ├── WikiPostRequest.java
        ├── WikiPostResponse.java
        ├── WikiBlockRequest.java
        ├── WikiFolderRequest.java
        └── WikiFolderResponse.java
```

---

## 3. 의존성 방향 (변경 전 → 변경 후)

### 변경 전 (문제 있는 구조)
```
Controller → Service → Mapper(@Mapper, Infrastructure)
```

### 변경 후 (DDD 올바른 구조)
```
presentation  →  application  →  domain  ←  infrastructure
(Controller)     (Service)       (Repository 인터페이스)   (RepositoryImpl + Mapper)
```

- `application`은 `domain`의 Repository **인터페이스**만 알고 있음
- `infrastructure`가 `domain`의 Repository 인터페이스를 **구현**
- `presentation`은 `application`의 Service만 알고 있음
- **하위 레이어가 상위 레이어를 알지 못함 (단방향 의존)**

---

## 4. 핵심 변경 코드 예시

### 4-1. Repository 인터페이스 도입 (domain 레이어)

**신규 생성: `task/domain/TaskPostRepository.java`**
```java
package com.mapo.palantier.task.domain;

import java.util.List;
import java.util.Optional;

public interface TaskPostRepository {
    List<TaskPost> findAll();
    List<TaskPost> findByFolderId(Long folderId);
    Optional<TaskPost> findById(Long id);
    Optional<TaskPost> findByIdWithBlocks(Long id);
    void insert(TaskPost post);
    void update(TaskPost post);
    void softDelete(Long id);
}
```

**신규 생성: `task/domain/TaskBlockRepository.java`**
```java
package com.mapo.palantier.task.domain;

import java.util.List;

public interface TaskBlockRepository {
    List<TaskBlock> findByPostId(Long postId);
    void insert(TaskBlock block);
    void deleteByPostId(Long postId);
}
```

---

### 4-2. RepositoryImpl 구현 (infrastructure 레이어)

**신규 생성: `task/infrastructure/TaskPostRepositoryImpl.java`**
```java
package com.mapo.palantier.task.infrastructure;

import com.mapo.palantier.task.domain.TaskPost;
import com.mapo.palantier.task.domain.TaskPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class TaskPostRepositoryImpl implements TaskPostRepository {

    private final TaskPostMapper taskPostMapper;

    @Override
    public List<TaskPost> findAll() {
        return taskPostMapper.findAll();
    }

    @Override
    public List<TaskPost> findByFolderId(Long folderId) {
        return taskPostMapper.findByFolderId(folderId);
    }

    @Override
    public Optional<TaskPost> findById(Long id) {
        return taskPostMapper.findById(id);
    }

    @Override
    public Optional<TaskPost> findByIdWithBlocks(Long id) {
        return taskPostMapper.findByIdWithBlocks(id);
    }

    @Override
    public void insert(TaskPost post) {
        taskPostMapper.insert(post);
    }

    @Override
    public void update(TaskPost post) {
        taskPostMapper.update(post);
    }

    @Override
    public void softDelete(Long id) {
        taskPostMapper.softDelete(id);
    }
}
```

---

### 4-3. Service 변경 (application 레이어) — Mapper → Repository 인터페이스로 교체

**변경 전 (`TaskPostService.java`)**
```java
// ❌ Mapper(Infrastructure)를 직접 주입
private final TaskPostMapper taskPostMapper;
private final TaskBlockMapper taskBlockMapper;
```

**변경 후 (`application/TaskPostService.java`)**
```java
// ✅ Repository 인터페이스(Domain)만 의존
private final TaskPostRepository taskPostRepository;
private final TaskBlockRepository taskBlockRepository;

@Transactional
public Long savePost(TaskPostRequest request, Long currentUserId) {
    TaskPost post = TaskPost.create(request.getFolderId(), request.getTitle(), currentUserId);

    if (request.getId() == null) {
        taskPostRepository.insert(post);
    } else {
        post = TaskPost.modify(request.getId(), request.getFolderId(), request.getTitle(), currentUserId);
        taskPostRepository.update(post);
        taskBlockRepository.deleteByPostId(post.getId());
    }

    if (request.getBlocks() != null) {
        List<TaskBlock> blocks = TaskBlock.createBlocks(post.getId(), request.getBlocks());
        blocks.forEach(taskBlockRepository::insert);
    }

    return post.getId();
}
```

---

### 4-4. DTO를 presentation/dto 로 이동

**현재**: `task/dto/TaskPostDto.java` (레이어 미분류)

**변경 후**: `task/presentation/dto/TaskPostRequest.java` (Request), `TaskPostResponse.java` (Response)

- Request DTO: Controller → Service 로 전달하는 입력값
- Response DTO: Service → Controller → 클라이언트로 나가는 출력값
- 도메인 객체(`TaskPost`)를 직접 Controller에서 반환하지 않음

---

## 5. 단계별 작업 순서

> 한 번에 전체를 바꾸면 빌드가 깨짐 → **도메인 단위로 순서대로 진행**

### Phase 1 — `task/post` 리팩토링 (가장 복잡, 먼저 패턴 확립)

- [ ] `task/domain/` 폴더 생성
- [ ] `TaskPost.java` → `task/domain/` 으로 이동
- [ ] `TaskBlock.java`, `BlockType.java` → `task/domain/` 으로 이동
- [ ] `task/domain/TaskPostRepository.java` 인터페이스 생성
- [ ] `task/domain/TaskBlockRepository.java` 인터페이스 생성
- [ ] `task/infrastructure/` 폴더 생성
- [ ] `TaskPostMapper.java`, `TaskBlockMapper.java` → `task/infrastructure/` 로 이동
- [ ] `TaskPostRepositoryImpl.java`, `TaskBlockRepositoryImpl.java` 생성
- [ ] `task/application/` 폴더 생성
- [ ] `TaskPostService.java` → `task/application/` 으로 이동 + Mapper 의존 → Repository 인터페이스로 교체
- [ ] `task/presentation/dto/` 폴더 생성
- [ ] `TaskPostDto.java` → `TaskPostRequest.java` / `TaskPostResponse.java` 로 분리
- [ ] `TaskPostController.java` → `task/presentation/` 으로 이동 + import 경로 수정
- [ ] 빌드 확인 ✅

### Phase 2 — `task/folder` 리팩토링

- [ ] `TaskFolder.java` → `task/domain/` 으로 이동
- [ ] `task/domain/TaskFolderRepository.java` 인터페이스 생성
- [ ] `TaskFolderMapper.java` → `task/infrastructure/` 로 이동
- [ ] `TaskFolderRepositoryImpl.java` 생성
- [ ] `TaskFolderService.java` → `task/application/` 으로 이동 + Mapper → Repository 교체
- [ ] `TaskFolderDto.java` → `task/presentation/dto/TaskFolderRequest.java` 로 이동
- [ ] `TaskFolderController.java` → `task/presentation/` 으로 이동
- [ ] 빌드 확인 ✅

### Phase 3 — `task/comment` 리팩토링

- [ ] Phase 1~2와 동일한 패턴으로 진행
- [ ] `task/dto/` 폴더 삭제 (비어있으면)
- [ ] 빌드 확인 ✅

### Phase 4 — `wiki` 도메인 전체 리팩토링

- [ ] `task` 리팩토링에서 확립한 패턴 그대로 `wiki`에 적용
- [ ] `wiki/post` → `wiki/folder` 순서로 진행
- [ ] 빌드 확인 ✅

---

## 6. 주의사항

### MyBatis XML 매퍼 경로 확인
- Mapper 인터페이스를 `infrastructure/`로 이동할 경우 `resources/` 하위 XML 파일의 `namespace` 경로도 함께 수정 필요
- 예: `namespace="com.mapo.palantier.task.post.TaskPostMapper"` → `namespace="com.mapo.palantier.task.infrastructure.TaskPostMapper"`

### import 경로 연쇄 수정
- 파일을 이동할 때마다 해당 클래스를 import하는 모든 파일의 경로가 바뀜
- IDE의 "Move/Refactor" 기능을 활용하면 자동으로 import 경로 수정 가능

### 빌드를 Phase마다 확인
- 전체를 한꺼번에 바꾸지 않고 Phase 단위로 빌드 성공 여부 확인 후 다음 단계 진행

---

## 7. 완료 기준 체크리스트

- [ ] `task`, `wiki` 모두 `application/`, `domain/`, `infrastructure/`, `presentation/` 4계층 구조 완성
- [ ] Service 클래스가 MyBatis `@Mapper`를 직접 주입하지 않음
- [ ] `domain/` 레이어에 Repository 인터페이스 존재
- [ ] `infrastructure/` 레이어에 Mapper + RepositoryImpl 존재
- [ ] DTO가 `presentation/dto/` 하위에 위치
- [ ] 전체 빌드 성공
- [ ] 기존 API 엔드포인트 동작 이상 없음 (회귀 테스트)
```

이제 계획서 내용을 실제 파일에 저장하겠습니다.