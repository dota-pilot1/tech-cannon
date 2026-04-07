# 프로젝트 아키텍처

## 기술 스택

### Backend (parantier-api)
- Spring Boot 4.0.4 / MyBatis / PostgreSQL / JWT

### Frontend (parantier-front)
- React + TypeScript / TanStack Router / TanStack Query / Vite

---

## 백엔드 패키지 구조

```
com.mapo.palantier
├── user/           application, domain, infrastructure, presentation
├── organization/   application, domain, infrastructure, presentation
├── authority/      application, domain, infrastructure, presentation
├── task/           application, domain, infrastructure, presentation
├── wiki/           application, domain, infrastructure, presentation
├── workspace/      application, domain, infrastructure, presentation
├── meeting/        application, domain, infrastructure, presentation
├── config/
└── common/         exception, dto
```

### DDD 레이어 원칙

| 레이어 | 역할 | 의존 방향 |
|--------|------|-----------|
| presentation | Controller, Request/Response DTO | → application |
| application | Service (비즈니스 흐름 조율) | → domain |
| domain | 도메인 객체, Repository 인터페이스 | 없음 |
| infrastructure | Mapper(@Mapper), RepositoryImpl | → domain 구현 |

### ⚠️ 필수 패키지 규칙
- ✅ 모든 코드는 `com.mapo.palantier` 하위에 작성
- ❌ `@ComponentScan`, `@MapperScan` 명시적 설정 금지
- ❌ 다른 루트 패키지(`com.palantier` 등) 사용 금지

---

## 프론트엔드 라우팅

### ⚠️ 수동 라우트 등록 방식 사용

파일 위치: `parantier-front/src/app/routes/index.tsx`

- 파일 기반 자동 라우팅 **사용 안 함**
- `src/routes/` 폴더에 파일 생성해도 자동 등록 **안 됨**
- **반드시 `index.tsx`에 수동 등록 필요**

### 새 페이지 추가 절차

```typescript
// 1. 페이지 컴포넌트 작성
// src/pages/mypage/MyPage.tsx

// 2. index.tsx에 import
import { MyPage } from '@/pages/mypage/MyPage'

// 3. createRoute 생성
const myPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mypage',
  beforeLoad: () => requireAuth(),
  component: MyPage,
})

// 4. routeTree.addChildren([...]) 배열에 추가
const routeTree = rootRoute.addChildren([
  ...기존라우트,
  myPageRoute,  // ⭐ 여기에 추가
])
```

### 권한 제어

```typescript
beforeLoad: () => requireAuth()          // 로그인 필요
beforeLoad: () => requireRole('ROLE_ADMIN')  // 어드민 전용
```

---

## DDD 코드 작성 원칙

### 의존성 방향 (단방향, 절대 역방향 금지)

```
presentation → application → domain ← infrastructure
```

- `application`(Service)은 `domain`의 Repository **인터페이스**만 알고 있음
- `infrastructure`(RepositoryImpl, Mapper)가 `domain` 인터페이스를 **구현**
- `presentation`(Controller)은 `application`의 Service만 호출

---

### ✅ 새 도메인 추가 체크리스트

새 기능(예: `comment`)을 만들 때 **반드시 이 순서대로** 파일 생성:

```
comment/
├── domain/
│   ├── Comment.java                  ✅ @Getter @Builder @NoArgsConstructor @AllArgsConstructor
│   └── CommentRepository.java        ✅ 인터페이스 (findById, insert, softDelete 등)
├── infrastructure/
│   ├── CommentMapper.java            ✅ @Mapper (MyBatis)
│   └── CommentRepositoryImpl.java    ✅ CommentRepository 구현체, Mapper 주입
├── application/
│   └── CommentService.java           ✅ CommentRepository 인터페이스만 주입
└── presentation/
    ├── CommentController.java        ✅ CommentService만 주입
    └── dto/
        ├── CommentRequest.java       ✅ @Getter @NoArgsConstructor
        └── CommentResponse.java      ✅ @Getter @Builder
```

---

### ❌ 금지 패턴

#### 1. Service → Mapper 직접 의존 금지

```java
// ❌ 절대 금지
@Service
public class CommentService {
    private final CommentMapper commentMapper; // Mapper를 직접 주입하면 안 됨
}

// ✅ 올바른 방법
@Service
public class CommentService {
    private final CommentRepository commentRepository; // 도메인 인터페이스만
}
```

#### 2. 도메인 객체에 @Data / @Setter 금지

```java
// ❌ 절대 금지
@Data  // @Setter가 포함되어 불변성 훼손
public class Comment { ... }

// ✅ 올바른 방법
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    private Long id;
    private String content;

    // 상태 변경은 도메인 메서드로만
    public static Comment create(Long postId, Long authorId, String content) {
        return Comment.builder()
            .postId(postId)
            .authorId(authorId)
            .content(content)
            .build();
    }
}
```

#### 3. 도메인 객체를 직접 Controller 응답으로 반환 금지

```java
// ❌ 도메인 객체를 그대로 반환
public ResponseEntity<Comment> getComment(@PathVariable Long id) {
    return ResponseEntity.ok(commentService.getById(id));
}

// ✅ Response DTO로 변환해서 반환
public ResponseEntity<CommentResponse> getComment(@PathVariable Long id) {
    Comment comment = commentService.getById(id);
    return ResponseEntity.ok(CommentResponse.from(comment));
}
```

---

### XML Mapper namespace 규칙

MyBatis XML 파일의 namespace와 type은 반드시 **infrastructure 패키지 경로** 사용:

```xml
<!-- ✅ 올바른 경로 -->
<mapper namespace="com.mapo.palantier.comment.infrastructure.CommentMapper">
    <resultMap type="com.mapo.palantier.comment.domain.Comment">
```

```xml
<!-- ❌ 금지 (구 패턴) -->
<mapper namespace="com.mapo.palantier.comment.CommentMapper">
```
