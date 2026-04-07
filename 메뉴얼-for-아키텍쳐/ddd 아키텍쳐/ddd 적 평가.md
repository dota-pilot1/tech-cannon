# DDD(도메인 주도 설계) 아키텍처 평가 보고서
> 대상: `mapo-palantier-project / parantier-api`
> 평가 기준: Eric Evans의 DDD 원칙 및 Layered Architecture 관점

---

## 1. 전체 패키지 구조 개요

```
com.mapo.palantier
├── user/
│   ├── application/      ✅ Application Layer
│   ├── domain/           ✅ Domain Layer
│   ├── infrastructure/   ✅ Infrastructure Layer
│   └── presentation/     ✅ Presentation Layer
├── authority/            ✅ 동일한 4-layer 구조
├── meeting/              ✅ 동일한 4-layer 구조
├── workspace/            ✅ 동일한 4-layer 구조
├── organization/         ✅ 동일한 4-layer 구조
├── task/                 ⚠️  레이어 미분리 (post, block, folder 서브 패키지만 존재)
├── wiki/                 ⚠️  레이어 미분리 (post, block, folder 서브 패키지만 존재)
└── common/               ✅ 공통 예외, DTO, Config
```

---

## 2. 도메인별 DDD 적용 평가

### ✅ 잘 지켜진 도메인: `user`, `authority`, `meeting`, `workspace`, `organization`

---

### 2-1. `user` 도메인 — ⭐⭐⭐⭐ (4/5)

**긍정적 평가**

- `domain/User.java`에 **도메인 로직이 존재**함
  - `createNewUser()` 정적 팩토리 메서드
  - `deactivate()`, `activate()` 상태 변경 메서드
  - `isAdmin()` 도메인 판단 메서드
- `UserRepository`가 **도메인 레이어에 인터페이스로 선언**되고, `infrastructure/UserRepositoryImpl`이 구현 → **의존성 역전(DIP) 준수**
- `application/UserService`는 도메인 객체를 통해 비즈니스 흐름을 조율

**개선 필요 사항**

- `User` 클래스에 `@Setter`가 붙어 있어 **불변성(Immutability)이 깨짐**
  - DDD에서 도메인 객체는 상태 변경을 메서드로만 노출해야 함
  - `setEmail()`, `setPassword()` 등이 외부에서 자유롭게 호출 가능한 상태
- `UserService.updateUserRole()`에서 도메인 객체를 직접 변경하지 않고 `userRepository.updateRole(userId, role)` 호출 → **도메인 로직이 Repository 쿼리에 의존**하는 빈약한 모델(Anemic Domain Model) 냄새

```java
// 현재 코드 (Anemic 패턴)
userRepository.updateRole(userId, role);

// DDD 권장 방식
user.changeRole(role);   // 도메인 객체 내 메서드
userRepository.save(user);
```

---

### 2-2. `authority` 도메인 — ⭐⭐⭐⭐ (4/5)

**긍정적 평가**

- `AuthorityService`에서 역할 기반 권한 + 개별 사용자 권한을 **합산하는 복잡한 도메인 로직**이 Application Layer에 잘 위치함
- `UserAuthority`, `Authority`, `Category`로 도메인 개념이 **명확히 분리**됨
- `UserAuthorityRepository` 인터페이스가 도메인 레이어에 존재 → DIP 준수

**개선 필요 사항**

- `Authority` 생성 로직이 `AuthorityService.createAuthority()`에 인라인으로 존재
  - 팩토리 메서드를 `Authority` 도메인 클래스 내부로 이동 권장

```java
// 현재 코드 (Service에 생성 로직)
Authority authority = Authority.builder().name(name)...build();

// DDD 권장 방식
Authority authority = Authority.create(name, description, categoryId);
```

---

### 2-3. `meeting` 도메인 — ⭐⭐⭐ (3/5)

**긍정적 평가**

- `application`, `domain`, `infrastructure`, `presentation` 레이어 분리 존재

**개선 필요 사항**

- `MeetingChannel` 도메인 객체가 **완전한 POJO + 수동 getter/setter** 구조로, Lombok도 미적용
  - 코드 일관성 부족
- `MeetingChannelService`에서 Mapper를 **직접 주입**하여 사용 → Infrastructure 레이어 의존성이 Application Layer로 누출됨
  - Repository 인터페이스를 도메인 레이어에 두고 구현체로 위임해야 함

```java
// 현재 코드 (Mapper 직접 의존)
private final MeetingChannelMapper meetingChannelMapper;

// DDD 권장 방식
private final MeetingChannelRepository meetingChannelRepository; // 도메인 인터페이스
```

- 채널 생성 시 `setIsActive(true)` 와 같은 **초기화 로직이 Service에 산재** → 도메인 생성자/팩토리로 이동 권장

---

### 2-4. `workspace` 도메인 — ⭐⭐⭐⭐ (4/5)

**긍정적 평가**

- `NodeType`, `NodeStatus`, `NodePriority` **Value Object(열거형)** 를 별도 파일로 분리하여 도메인 언어를 명확히 표현
- `WorkspaceNode`는 `@Getter` + `@Builder` 조합으로 **불변성에 가까운 구조** 유지
- `WorkspaceRepository` 인터페이스가 도메인 레이어에 존재

**개선 필요 사항**

- `WorkspaceNode`에 `createdByUsername`, `assignedToUsername` 같은 **조회용 필드가 도메인 객체에 혼재**
  - 조회 전용 DTO(Read Model)로 분리하는 것이 도메인 순수성을 유지하는 방법

---

### 2-5. `organization` 도메인 — ⭐⭐⭐ (3/5)

**긍정적 평가**

- `Organization` 도메인 객체에 `orgType`, `level`, `parentId`로 **계층 구조를 도메인 모델로 표현**

**개선 필요 사항**

- `Organization`에 `@Data` 어노테이션 사용 → `@Setter` 포함으로 **불변성 훼손**
- `children: List<Organization>`이 도메인 객체 안에 존재 → **트리 구조 조합 책임**이 불명확
  - 조회용 응답 모델(ViewModel/DTO)로 분리 권장
- `infrastructure` 레이어 없이 `presentation`이 `application`을 직접 호출하는 구조 — 레이어 일부 누락

---

### ⚠️ 미흡한 도메인: `task`, `wiki`

---

### 2-6. `task` 도메인 — ⭐⭐ (2/5)

**문제점**

- `task/post/`, `task/block/`, `task/folder/` 구조이며 **DDD 레이어 분리가 없음**
  - `application`, `domain`, `infrastructure`, `presentation` 구분 없이 파일이 동일 레벨에 혼재
- `TaskPost`는 `@Data`(Setter 포함) POJO로, **도메인 로직이 전혀 없는 순수 데이터 구조체(Anemic Domain Model)**
- `TaskPostService`가 **Mapper를 직접 주입**하여 Infrastructure에 직접 의존
- 블록 저장 로직이 Service 안에 반복문으로 구현 → 도메인 로직이 Application Layer에 집중

```java
// TaskPostService 내 블록 저장 (Service가 너무 많은 책임)
for (int i = 0; i < dto.getBlocks().size(); i++) {
    TaskBlock block = new TaskBlock();
    block.setPostId(post.getId());
    ...
    taskBlockMapper.insert(block);
}
```

**권장 개선 방향**

```
task/
├── application/   TaskPostService, TaskBlockService
├── domain/        TaskPost.java, TaskBlock.java, TaskPostRepository.java (인터페이스)
├── infrastructure/ TaskPostMapper.java, TaskPostRepositoryImpl.java
└── presentation/  TaskPostController.java
```

---

### 2-7. `wiki` 도메인 — ⭐⭐ (2/5)

- `task`와 동일한 구조적 문제 반복
- `WikiPost`도 Anemic Domain Model
- `WikiPostService`도 Mapper 직접 의존
- `tags` 필드가 `String`(콤마 구분 문자열)으로 저장 → **Value Object로 모델링할 기회 놓침**

```java
// 현재 (원시 타입으로 처리)
private String tags; // "컨벤션,TypeScript,필독"

// DDD 권장 (Value Object)
public class Tags {
    private final List<String> values;
    public static Tags from(String csv) { ... }
}
```

---

## 3. 공통 패턴 평가

### 3-1. Repository 패턴 — ⭐⭐⭐⭐ (일부 도메인)

| 도메인 | Repository 인터페이스 (domain 레이어) | 구현체 분리 (infrastructure) |
|--------|--------------------------------------|-------------------------------|
| user | ✅ UserRepository | ✅ UserRepositoryImpl |
| authority | ✅ AuthorityRepository | ✅ (Mapper 위임) |
| workspace | ✅ WorkspaceRepository | ✅ |
| organization | ✅ OrganizationRepository | ❌ infrastructure 레이어 없음 |
| task | ❌ 없음 (Mapper 직접 사용) | ❌ |
| wiki | ❌ 없음 (Mapper 직접 사용) | ❌ |
| meeting | ❌ 없음 (Mapper 직접 주입) | ❌ |

### 3-2. 예외 처리 — ⭐⭐⭐⭐ (4/5)

- `common/exception/` 하위에 도메인별 예외(`UserNotFoundException`, `DuplicateEmailException` 등) 분리 ✅
- `ErrorCode` enum으로 에러 코드 중앙 관리 ✅
- `GlobalExceptionHandler`로 전역 예외 처리 ✅
- 일부 도메인에서 여전히 `IllegalArgumentException` 직접 throw → 도메인 전용 예외로 통일 권장 ⚠️

### 3-3. DTO 경계 — ⭐⭐⭐ (3/5)

- `presentation/dto/` 하위에 Request/Response 분리된 도메인 있음 (authority) ✅
- 일부 도메인은 DTO와 도메인 객체를 동일하게 사용하거나 `@Data` 도메인 클래스를 그대로 응답으로 사용 ⚠️
- Presentation Layer ↔ Application Layer 경계에서 변환(Mapping) 책임이 불명확한 곳 존재

---

## 4. Bounded Context 관점 평가

현재 각 최상위 패키지(`user`, `task`, `wiki`, `meeting` 등)가 **Bounded Context의 역할**을 담당하고 있으며 이는 올바른 방향입니다.

그러나 아래와 같은 컨텍스트 경계 침범이 발견됩니다:

- `WorkspaceNode`에 `assignedToUsername` 직접 보유 → `user` 컨텍스트의 정보가 `workspace` 도메인 객체에 침투
- `TaskPost`에 `authorName` 직접 보유 → 동일한 문제
- **권장**: 조회 전용 Read Model(DTO/ViewModel)을 별도로 두고, 도메인 객체는 ID 참조만 보유

---

## 5. 종합 평가표

| 평가 항목 | 점수 | 비고 |
|-----------|------|------|
| 레이어 분리 (Layered Architecture) | ⭐⭐⭐⭐ | 주요 도메인은 4계층 분리, task/wiki는 미흡 |
| 도메인 객체 풍부성 (Rich Domain Model) | ⭐⭐⭐ | user만 부분적으로 구현, 나머지는 Anemic |
| 의존성 역전 원칙 (DIP / Repository 인터페이스) | ⭐⭐⭐⭐ | user, authority, workspace는 우수 |
| Bounded Context 분리 | ⭐⭐⭐⭐ | 패키지 단위 분리 잘 됨, 내부 침투 일부 존재 |
| 불변성 (Immutability) | ⭐⭐ | @Data, @Setter 남용으로 불변성 부족 |
| Value Object 활용 | ⭐⭐⭐ | Enum VO는 있으나 문자열 VO 미활용 |
| 예외 처리 일관성 | ⭐⭐⭐⭐ | 공통 예외 구조 우수, 일부 직접 throw 혼용 |
| **종합** | **⭐⭐⭐ (3.3/5)** | 핵심 도메인 우수, 콘텐츠 도메인 개선 필요 |

---

## 6. 우선순위별 개선 권고

### 🔴 높은 우선순위

1. **`task`, `wiki` 도메인 레이어 분리**
   - `application/`, `domain/`, `infrastructure/`, `presentation/` 구조로 재편
   - Mapper 직접 의존 → Repository 인터페이스 도입

2. **Anemic Domain Model 개선**
   - `TaskPost`, `WikiPost` 등에 상태 변경 메서드 추가
   - `@Data` → `@Getter` + 명시적 메서드로 변경

### 🟡 중간 우선순위

3. **`@Setter` / `@Data` 제거 → 불변성 강화**
   - 도메인 객체는 `@Getter` + `@Builder`만 사용
   - 상태 변경은 도메인 메서드로만 허용

4. **조회용 Read Model 분리**
   - `WorkspaceNode`, `TaskPost`의 JOIN 결과 필드를 별도 Response DTO로 이동

### 🟢 낮은 우선순위

5. **Value Object 도입**
   - `WikiPost.tags` → `Tags` VO
   - 이메일, 비밀번호 등 원시값 래핑

6. **도메인 팩토리 메서드 확대**
   - `user`의 `createNewUser()` 패턴을 다른 도메인에도 적용

---

## 7. 결론

`user`, `authority`, `workspace` 등 **핵심 도메인은 DDD의 레이어 아키텍처를 충실히 구현**하고 있으며, Repository 패턴과 의존성 역전도 잘 적용되어 있습니다.

반면 `task`, `wiki`와 같은 **콘텐츠 중심 도메인은 절차적 스타일**로 구현되어 DDD와 거리가 있습니다. 서비스가 커질수록 이 불일치가 유지보수의 병목이 될 수 있으므로, 점진적으로 레이어 분리와 도메인 로직 내재화를 진행하는 것을 권장합니다.

전반적으로 **DDD를 향한 올바른 방향성은 확립**되어 있으며, 일관성 있는 적용이 다음 과제입니다.