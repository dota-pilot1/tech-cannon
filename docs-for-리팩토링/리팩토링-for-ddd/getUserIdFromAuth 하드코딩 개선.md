# `getUserIdFromAuth()` 하드코딩 개선

> 상태: ✅ 리팩토링 완료
> 대상 도메인: `task`, `wiki`
> 변경 파일 수: 5개

---

## 문제 원인

`task`, `wiki` 도메인의 모든 Controller에 아래 코드가 존재했다.

```java
// 변경 전 — task/wiki Controller 5개 공통
private Long getUserIdFromAuth(Authentication auth) {
    // TODO: JWT 토큰에서 userId 추출
    return 1L;  // ← 항상 userId = 1번으로 하드코딩
}
```

---

## 왜 문제인가

### 1. 로그인한 사용자와 무관하게 항상 userId = 1번으로 저장된다

어떤 사용자가 로그인해서 게시글을 작성하더라도
`authorId`가 항상 `1`로 저장된다.
실제 작성자 정보가 DB에 기록되지 않는다.

### 2. `JwtAuthenticationFilter`가 이미 userId를 꺼내서 저장해두고 있다

`JwtAuthenticationFilter`는 JWT 토큰에서 `userId`를 추출한 뒤
`request.setAttribute("userId", userId)` 로 저장한다.

```java
// JwtAuthenticationFilter.java
Long userId = jwtTokenProvider.getUserIdFromToken(token);

// Filter가 이미 여기서 userId를 저장해둠
request.setAttribute("userId", userId);
```

Controller가 `Authentication`을 받아서 다시 `getPrincipal()`로 꺼내는 건
Filter의 의도를 무시하는 중복 처리다.

### 3. `getPrincipal()`은 의도가 불명확하다

`Authentication.getPrincipal()`은 Spring Security의 범용 메서드로,
원래 `UserDetails` 객체를 반환하도록 설계됐다.
이 프로젝트에서는 `Long(userId)` 하나만 Principal로 저장했기 때문에
코드를 읽는 사람 입장에서 **"왜 getPrincipal()이 Long을 반환하지?"** 라는 의문이 생긴다.

### 4. 5개 Controller에 동일한 잘못된 코드가 중복된다

같은 TODO 코드가 5곳에 복사돼 있어서
나중에 인증 방식이 바뀌면 5곳을 모두 수정해야 한다.

---

## 개선 내용

`Authentication auth` 파라미터와 `getUserIdFromAuth()` 메서드를 완전히 제거하고,
`@RequestAttribute("userId") Long userId` 로 교체한다.

### 변경 전 → 변경 후

```java
// ❌ 변경 전
@PostMapping
public ResponseEntity<Long> savePost(
    @RequestBody TaskPostRequest request,
    Authentication auth                        // Filter가 이미 처리한 걸 다시 받음
) {
    Long userId = getUserIdFromAuth(auth);      // getPrincipal()로 다시 꺼냄
    return ResponseEntity.ok(taskPostService.savePost(request, userId));
}

private Long getUserIdFromAuth(Authentication auth) {
    // TODO: JWT 토큰에서 userId 추출
    return 1L;
}

// ✅ 변경 후
@PostMapping
public ResponseEntity<Long> savePost(
    @RequestBody TaskPostRequest request,
    @RequestAttribute("userId") Long userId    // Filter가 저장한 값을 직접 꺼냄
) {
    return ResponseEntity.ok(taskPostService.savePost(request, userId));
}
```

### 왜 `@RequestAttribute`가 교과서적인가

```
JWT 요청
  ↓
JwtAuthenticationFilter
  └── userId 추출
  └── request.setAttribute("userId", userId)  ← 여기서 저장
  ↓
Controller
  └── @RequestAttribute("userId") Long userId  ← 여기서 꺼냄 (의도대로)
```

- Filter가 인증을 전담하고, Controller는 인증 방식을 전혀 알 필요가 없다
- `getPrincipal()` 같은 Spring Security 내부 구조에 의존하지 않는다
- 파라미터만 봐도 **"이 메서드는 로그인한 userId가 필요하다"** 는 의도가 바로 보인다

---

## 변경 파일 목록

| 파일 | 변경 내용 |
|------|---------|
| `task/presentation/TaskPostController.java` | `Authentication auth` + `getUserIdFromAuth()` 제거 → `@RequestAttribute("userId")` |
| `task/presentation/TaskFolderController.java` | 동일 |
| `task/presentation/TaskCommentController.java` | 동일 |
| `wiki/presentation/WikiPostController.java` | 동일 |
| `wiki/presentation/WikiFolderController.java` | 동일 |

---

## 완료 체크리스트

- [x] `TaskPostController` 교체
- [x] `TaskFolderController` 교체
- [x] `TaskCommentController` 교체
- [x] `WikiPostController` 교체
- [x] `WikiFolderController` 교체
- [x] 빌드 성공 확인 (`BUILD SUCCESSFUL`)
- [ ] 로그인한 사용자로 게시글 생성 시 `authorId`가 실제 userId로 저장되는지 확인

---

## 참고 — 새 Controller에서 로그인 userId가 필요할 때

`getUserIdFromAuth()` 같은 헬퍼 메서드 없이, 파라미터에 바로 선언한다.

```java
@PostMapping
public ResponseEntity<Long> createSomething(
    @RequestBody SomeRequest request,
    @RequestAttribute("userId") Long userId   // 이렇게만 쓰면 끝
) {
    return ResponseEntity.ok(someService.create(request, userId));
}
```

`JwtAuthenticationFilter`가 인증된 요청에 `userId`를 항상 세팅해주므로
추가 구현 없이 이 한 줄로 충분하다.