# UserRole Enum과 ROLE_ 접두사

## 개요

회원가입 시 사용자에게 부여되는 역할(Role)을 관리하기 위해 `UserRole` Enum을 사용합니다.
이 문서에서는 Enum으로 역할을 정의한 이유와 `ROLE_` 접두사의 의미를 설명합니다.

---

## UserRole Enum 정의

**파일**: `src/main/java/com/mapo/palantier/user/domain/UserRole.java`

```java
package com.mapo.palantier.user.domain;

public enum UserRole {
    ROLE_USER,
    ROLE_ADMIN
}
```

---

## 1. 데이터베이스 저장 방식

### Enum을 DB에 저장하는 두 가지 방법

#### EnumType.STRING (권장 ✅)

**User 엔티티에서 사용**:
```java
@Entity
public class User {
    @Enumerated(EnumType.STRING)  // ← 문자열로 저장
    @Column(nullable = false)
    private UserRole role;
}
```

**DB에 실제 저장되는 값**:
```sql
-- users 테이블
INSERT INTO users (email, password, username, role, is_active)
VALUES ('user@test.com', 'encoded', '테스터', 'ROLE_USER', true);

INSERT INTO users (email, password, username, role, is_active)
VALUES ('admin@test.com', 'encoded', '관리자', 'ROLE_ADMIN', true);
```

**장점**:
1. **가독성**: DB에서 직접 봐도 의미 파악 가능
   ```sql
   SELECT email, role FROM users;
   -- user@test.com  | ROLE_USER
   -- admin@test.com | ROLE_ADMIN
   ```

2. **안정성**: Enum 순서 변경해도 기존 데이터 안전
   ```java
   // Enum 순서 바꿔도 DB 데이터는 영향 없음
   public enum UserRole {
       ROLE_ADMIN,   // 순서 변경
       ROLE_USER
   }
   ```

3. **확장성**: 새 역할 추가 시 기존 데이터 영향 없음
   ```java
   public enum UserRole {
       ROLE_USER,
       ROLE_ADMIN,
       ROLE_MODERATOR  // 새 역할 추가
   }
   ```

#### EnumType.ORDINAL (비권장 ❌)

**사용하지 않는 이유**:
```java
@Enumerated(EnumType.ORDINAL)  // ← 순서 번호로 저장
private UserRole role;
```

**DB에 저장되는 값**:
```sql
-- 0: ROLE_USER, 1: ROLE_ADMIN
INSERT INTO users (role) VALUES (0);  -- ROLE_USER
INSERT INTO users (role) VALUES (1);  -- ROLE_ADMIN
```

**문제점**:
1. **가독성 없음**: DB에서 0, 1로 보임
2. **순서 의존성**: Enum 순서 바꾸면 기존 데이터 의미 변경
   ```java
   // Before
   public enum UserRole {
       ROLE_USER,    // 0
       ROLE_ADMIN    // 1
   }

   // After (순서 변경)
   public enum UserRole {
       ROLE_ADMIN,   // 0 ← 기존 ROLE_USER(0)가 ROLE_ADMIN으로 변경됨!
       ROLE_USER     // 1
   }
   ```

---

## 2. 왜 Enum으로 관리하는가?

### String 방식의 문제점

```java
// String으로 역할 저장 시 (❌ 비권장)
public class User {
    private String role;  // 어떤 값이든 들어갈 수 있음
}

// 사용 시
user.setRole("ROLE_USER");      // ✅ OK
user.setRole("ROLE_SUPERUSER"); // ✅ 컴파일 통과 (런타임 에러!)
user.setRole("role_user");      // ✅ 컴파일 통과 (대소문자 오타!)
user.setRole("ADMIN");          // ✅ 컴파일 통과 (ROLE_ 빠뜨림!)
user.setRole("asdfasdf");       // ✅ 컴파일 통과 (의미 없는 값!)
```

**문제점**:
- 컴파일 타임에 오류 감지 불가능
- 잘못된 값 입력 가능
- IDE 자동완성 불가능
- 오타 발생 가능

### Enum 방식의 장점

```java
// Enum으로 역할 관리 시 (✅ 권장)
public enum UserRole {
    ROLE_USER,
    ROLE_ADMIN
}

public class User {
    private UserRole role;  // 정의된 값만 들어갈 수 있음
}

// 사용 시
user.setRole(UserRole.ROLE_USER);   // ✅ OK
user.setRole(UserRole.ROLE_ADMIN);  // ✅ OK
user.setRole(UserRole.ROLE_SUPER);  // ❌ 컴파일 에러!
user.setRole("ROLE_USER");          // ❌ 컴파일 에러! (타입 불일치)
```

**장점**:
1. **타입 안정성 (Type Safety)**
   - 컴파일 타임에 잘못된 값 차단
   - 정의되지 않은 역할 사용 불가능

2. **IDE 자동완성**
   ```java
   user.setRole(UserRole.  // ← IDE가 ROLE_USER, ROLE_ADMIN 자동 제안
   ```

3. **리팩토링 안전**
   ```java
   // Enum 이름 변경 시
   ROLE_USER → ROLE_MEMBER
   // ↓
   // IDE가 모든 사용처 자동 변경

   // String이었다면
   "ROLE_USER" → "ROLE_MEMBER"
   // ↓
   // 전체 검색해서 수동 변경 필요...
   ```

4. **확장 가능성**
   ```java
   // 새 역할 추가 간단
   public enum UserRole {
       ROLE_USER,
       ROLE_ADMIN,
       ROLE_MODERATOR,  // 추가
       ROLE_GUEST       // 추가
   }
   ```

---

## 3. ROLE_ 접두사의 의미

### Spring Security의 관례 (Convention)

Spring Security는 **역할(Role)**과 **권한(Authority)**을 구분합니다.

#### 권한 (Authority)
**의미**: 구체적인 행위에 대한 권한
```java
@PreAuthorize("hasAuthority('READ_PRIVILEGE')")
@PreAuthorize("hasAuthority('WRITE_PRIVILEGE')")
@PreAuthorize("hasAuthority('DELETE_PRIVILEGE')")
```

#### 역할 (Role)
**의미**: 권한의 묶음
```java
@PreAuthorize("hasRole('USER')")   // 읽기 권한
@PreAuthorize("hasRole('ADMIN')")  // 읽기 + 쓰기 + 삭제 권한
```

### Spring Security의 자동 접두사 추가

```java
// Controller에서 권한 체크
@PreAuthorize("hasRole('USER')")  // ← 'USER'만 씀 (ROLE_ 없음)
public String userPage() {
    return "user-page";
}

@PreAuthorize("hasRole('ADMIN')")  // ← 'ADMIN'만 씀
public String adminPage() {
    return "admin-page";
}
```

**Spring Security가 내부적으로 하는 일**:
1. `hasRole('USER')` 호출
2. **자동으로 `ROLE_` 접두사 추가**
3. 실제로는 `ROLE_USER` 권한 체크

### Spring Security 내부 구현

```java
// SecurityExpressionRoot.java (Spring Security 소스코드)
public final boolean hasRole(String role) {
    return hasAnyRole(role);
}

private boolean hasAnyRole(String... roles) {
    return hasAnyAuthorityName(defaultRolePrefix, roles);
    // defaultRolePrefix = "ROLE_"
}

private boolean hasAnyAuthorityName(String prefix, String... roles) {
    Set<String> roleSet = getAuthoritySet();

    for (String role : roles) {
        // "USER" → "ROLE_USER" 자동 변환
        String defaultedRole = getRoleWithDefaultPrefix(prefix, role);
        if (roleSet.contains(defaultedRole)) {
            return true;
        }
    }
    return false;
}
```

**핵심**:
- `hasRole('USER')` 호출 시 → 내부에서 `"ROLE_USER"` 로 변환
- DB에 `ROLE_USER`로 저장되어 있어야 매칭됨

### 만약 ROLE_ 없이 정의하면?

```java
// ROLE_ 없이 정의한 경우 (❌)
public enum UserRole {
    USER,    // ROLE_ 없음
    ADMIN
}
```

**DB에 저장되는 값**:
```sql
INSERT INTO users (role) VALUES ('USER');   -- ROLE_ 없이 저장
INSERT INTO users (role) VALUES ('ADMIN');
```

**문제 발생**:
```java
@PreAuthorize("hasRole('USER')")
// Spring이 "ROLE_USER" 찾음
public String userPage() {
    return "user-page";
}
// ❌ 권한 체크 실패! (DB에는 "USER"로 저장되어 있음)
```

**해결 방법 3가지**:

#### 방법 1: hasAuthority() 사용 (ROLE_ 자동 추가 안 함)
```java
@PreAuthorize("hasAuthority('USER')")  // ROLE_ 안 붙음
public String userPage() {
    return "user-page";
}
```

#### 방법 2: ROLE_ 명시적으로 붙임
```java
@PreAuthorize("hasAuthority('ROLE_USER')")  // 직접 ROLE_ 붙임
public String userPage() {
    return "user-page";
}
```

#### 방법 3: Enum에 ROLE_ 접두사 추가 (권장 ✅)
```java
public enum UserRole {
    ROLE_USER,   // ROLE_ 접두사 추가
    ROLE_ADMIN
}

// Controller에서는 Spring Security 관례대로 사용
@PreAuthorize("hasRole('USER')")  // Spring이 자동으로 ROLE_USER로 변환
```

---

## 4. 역사적 배경

### 왜 ROLE_ 접두사가 생겼을까?

**Spring Security 초기 설계**:
- **Authority**: 모든 권한의 통칭 (읽기, 쓰기, 삭제, 역할 등)
- **Role**: Authority의 특수한 타입 (여러 권한의 묶음)

**구분 방법**:
- Role은 `ROLE_` 접두사로 시작
- 일반 Authority는 접두사 없음

**예시**:
```java
// Authorities (권한)
- READ_PRIVILEGE
- WRITE_PRIVILEGE
- DELETE_PRIVILEGE

// Roles (역할 = 권한의 묶음)
- ROLE_USER    → READ_PRIVILEGE 포함
- ROLE_ADMIN   → READ_PRIVILEGE, WRITE_PRIVILEGE, DELETE_PRIVILEGE 포함
```

**편의성**:
```java
// 역할 체크 시 ROLE_ 생략 가능
hasRole('USER')  // 자동으로 ROLE_USER로 변환

// 권한 체크 시 그대로 사용
hasAuthority('READ_PRIVILEGE')  // 그대로 사용
```

---

## 5. 실제 사용 예시

### 회원가입 시

**AuthService.java**:
```java
@Transactional
public User signup(String email, String password, String username) {
    // ...

    // User 도메인 객체 생성 (팩토리 메서드)
    User newUser = User.createNewUser(email, encodedPassword, username);

    // ...
}
```

**User.java**:
```java
public static User createNewUser(String email, String password, String username) {
    User user = new User();
    user.email = email;
    user.password = password;
    user.username = username;
    user.role = UserRole.ROLE_USER;  // 기본 역할 부여
    user.isActive = true;
    return user;
}
```

**결과**:
```sql
-- DB에 저장
INSERT INTO users (email, password, username, role, is_active)
VALUES ('test@test.com', 'encoded_pw', '테스터', 'ROLE_USER', true);
```

### 로그인 시 JWT 토큰에 역할 포함

**AuthService.java**:
```java
@Transactional(readOnly = true)
public String login(String email, String password) {
    // 1. 사용자 조회 및 검증
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AuthenticationException(ErrorCode.INVALID_CREDENTIALS));

    // 2. 비밀번호 검증
    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new AuthenticationException(ErrorCode.INVALID_CREDENTIALS);
    }

    // 3. 계정 활성화 확인
    if (!user.getIsActive()) {
        throw new AccountInactiveException(ErrorCode.ACCOUNT_INACTIVE);
    }

    // 4. JWT 토큰 생성 (역할 포함)
    return jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
    // user.getRole().name() → "ROLE_USER" 또는 "ROLE_ADMIN"
}
```

**JwtTokenProvider.java**:
```java
public String generateToken(String email, String role) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + expirationTime);

    return Jwts.builder()
            .subject(email)
            .claim("role", role)  // "ROLE_USER" 또는 "ROLE_ADMIN"
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(secretKey)
            .compact();
}
```

**생성된 JWT 토큰 (디코딩)**:
```json
{
  "sub": "test@test.com",
  "role": "ROLE_USER",
  "iat": 1711096800,
  "exp": 1711183200
}
```

### 권한 체크 시

```java
// Controller
@GetMapping("/user-only")
@PreAuthorize("hasRole('USER')")  // ROLE_USER 권한 필요
public String userOnlyPage() {
    return "user-page";
}

@GetMapping("/admin-only")
@PreAuthorize("hasRole('ADMIN')")  // ROLE_ADMIN 권한 필요
public String adminOnlyPage() {
    return "admin-page";
}
```

**동작 과정**:
1. 클라이언트가 JWT 토큰과 함께 요청
2. Spring Security가 JWT에서 역할 추출: `"ROLE_USER"`
3. `hasRole('USER')` 호출 시 Spring이 자동으로 `"ROLE_USER"`로 변환
4. JWT의 `"ROLE_USER"`와 매칭
5. 권한 체크 통과

---

## 요약

| 항목 | 내용 |
|------|------|
| **저장 방식** | `@Enumerated(EnumType.STRING)`으로 "ROLE_USER", "ROLE_ADMIN" 문자열로 DB 저장 |
| **Enum 사용 이유** | 타입 안정성 (컴파일 타임 체크), IDE 자동완성, 리팩토링 안전, 확장 용이 |
| **ROLE_ 접두사** | Spring Security 관례. `hasRole('USER')` 호출 시 자동으로 `ROLE_` 붙여서 `ROLE_USER` 체크 |
| **역할 vs 권한** | 역할(Role)은 `ROLE_` 접두사, 권한(Authority)은 접두사 없음 |
| **현재 역할** | `ROLE_USER` (기본 사용자), `ROLE_ADMIN` (관리자) |

**핵심 포인트**:
1. **Enum** = 타입 안정성 (컴파일 타임 오류 검증)
2. **EnumType.STRING** = DB 저장 방식 (가독성 + 안정성)
3. **ROLE_ 접두사** = Spring Security 관례 (자동 접두사 추가 기능 활용)

이 세 가지가 결합되어 **견고하고 유지보수하기 쉬운 역할 관리 시스템**을 구성합니다.

---

## Convention over Configuration의 또 다른 예시

Spring Security가 정한 관례:
- "역할은 `ROLE_`로 시작한다"
- "`hasRole()` 메서드는 자동으로 `ROLE_` 접두사를 붙인다"

개발자는 이 관례를 따르기만 하면:
- `hasRole('USER')` 라고 간결하게 작성 가능
- Spring이 알아서 `ROLE_USER`로 변환하여 체크
- 코드가 간결해지고 일관성 유지

**명시성은 낮지만, 생산성과 일관성은 높아집니다.**
