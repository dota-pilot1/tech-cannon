# Convention over Configuration: Spring의 관례 기반 개발

## 개요

Spring Framework는 **"Convention over Configuration"** (설정보다 관례) 철학을 따릅니다.
이는 개발자가 명시적으로 모든 것을 설정하지 않고, **"이렇게 하면 될 것이다"**라는 관례를 따라 개발하는 방식입니다.

## 핵심 질문

> "스프링에서 기본 제공하는 함수는 직관적이지 않을 때, 내부적으로 이런저런거 알아서 처리하겠거니 그냥 어느 정도 예상하고 문서를 찾아보는식으로 개발하는거라는 거지?"

**정답: 맞습니다!**

Spring 개발은:
1. **80%는 관례에 따라** "이렇게 하면 되겠지" 하고 코드 작성
2. **20%는 문서 확인** 필요할 때만
3. **내부 동작은 선택적으로** 궁금하면 파기

---

## 직관적이지 않은 Spring 함수들

### 1. passwordEncoder.matches()

**사용 코드**:
```java
if (!passwordEncoder.matches(password, user.getPassword())) {
    throw new AuthenticationException(ErrorCode.INVALID_CREDENTIALS);
}
```

**직관적인 예상**:
```java
// "이렇게 비교하는 거 아닌가?"
if (!passwordEncoder.encode(password).equals(user.getPassword())) {
    // ...
}
```

**실제 동작**:
- BCrypt는 매번 다른 salt를 사용해서 같은 비밀번호도 다른 해시값 생성
- `matches()`는 내부적으로:
  1. 저장된 해시에서 salt 추출
  2. 입력 비밀번호를 추출한 salt로 해싱
  3. 결과 비교

**개발 프로세스**:
```
1. "이름이 matches니까 비교하는 거겠지?" (예상)
2. 코드 작성: passwordEncoder.matches(raw, encoded)
3. 테스트: "잘 되네!" (믿음)
4. 궁금하면 문서 확인: "아, BCrypt가 salt를 해시에 포함하는구나" (선택적 학습)
```

---

### 2. @RestControllerAdvice

**사용 코드**:
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateEmailException(...) {
        // ...
    }
}
```

**비직관적인 부분**:
- 이 클래스를 어디서 호출하는가?
- Controller와 어떻게 연결되는가?
- Spring이 어떻게 이걸 찾는가?

**실제 동작**:
1. Spring이 시작할 때 `@RestControllerAdvice` 어노테이션이 붙은 클래스를 자동으로 스캔
2. 예외 발생 시 자동으로 매칭되는 `@ExceptionHandler` 메서드 실행
3. 개발자는 그냥 "이렇게 하면 되겠지" 하고 작성

**개발 프로세스**:
```
1. "GlobalExceptionHandler 만들고 @RestControllerAdvice 붙이면 되겠지?" (관례)
2. 코드 작성
3. 테스트: "예외가 자동으로 처리되네!" (믿음)
4. 내부 동작은 신경 안 씀
```

---

### 3. @Transactional

**사용 코드**:
```java
@Transactional
public User signup(String email, String password, String username) {
    if (userRepository.existsByEmail(email)) {
        throw new DuplicateEmailException(ErrorCode.DUPLICATE_EMAIL);
    }
    
    userRepository.save(newUser);
    return newUser;
}
```

**비직관적인 부분**:
- 트랜잭션 시작/커밋/롤백 코드가 없는데?
- 예외 발생 시 자동으로 롤백되는가?

**실제 동작**:
- Spring AOP가 메서드 실행 전/후에 트랜잭션 로직 자동 추가
- 예외 발생 시 자동 롤백
- 정상 완료 시 자동 커밋

**개발 프로세스**:
```
1. "@Transactional 붙이면 되겠지?" (관례)
2. 코드 작성
3. 테스트: "예외 발생해도 롤백되네!" (믿음)
4. AOP 내부 동작은 나중에 알아도 됨
```

---

### 4. 의존성 주입 (Dependency Injection)

**사용 코드**:
```java
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    // 생성자가 없는데 어떻게 주입되는가?
}
```

**비직관적인 부분**:
- `userRepository` 객체는 어디서 생성되는가?
- 생성자가 없는데 어떻게 주입되는가?

**실제 동작**:
- `@RequiredArgsConstructor`: Lombok이 final 필드로 생성자 자동 생성
- Spring이 생성자를 통해 의존성 자동 주입
- 개발자는 그냥 선언만 하면 됨

**개발 프로세스**:
```
1. "final 붙이고 @RequiredArgsConstructor 쓰면 되겠지?" (관례)
2. 코드 작성
3. 테스트: "자동으로 주입되네!" (믿음)
4. Lombok + Spring 동작 원리는 나중에
```

---

## Spring 개발의 실제 프로세스

### 신입 개발자 (처음 3~6개월)

```
단계 1: 일단 따라 하기
    ↓
"이렇게 하면 된다던데..." (블로그/튜토리얼)
    ↓
코드 작성 (복붙 + 수정)
    ↓
에러 발생 → 구글링 → 해결
    ↓
"아, 이게 이렇게 동작하는구나" (점진적 학습)
    ↓
6개월 후: "이제 좀 감이 온다"
```

### 경력 개발자 (1년 이상)

```
관례 파악 → 코드 작성 → 90% 바로 동작
                    ↓ (10%)
                문서 확인 → 해결
                    ↓
            필요시 내부 동작 파악
```

---

## Go와의 비교

### Go: 명시적 개발 (Explicit)

**에러 처리**:
```go
// 모든 것이 명시적
user, err := repo.FindByEmail(email)
if err != nil {  // 반드시 체크
    return nil, err
}

password, err := validator.Check(input)
if err != nil {  // 또 체크
    return nil, err
}
```

**트랜잭션**:
```go
// 명시적 트랜잭션 관리
tx, err := db.Begin()  // 시작
if err != nil {
    return err
}
defer tx.Rollback()  // 롤백 예약

if err := repo.Save(tx, user); err != nil {
    return err
}

return tx.Commit()  // 커밋
```

**의존성 주입**:
```go
// 명시적 생성 및 주입
userRepo := NewUserRepository(db)
passwordEncoder := NewBCryptEncoder()
authService := NewAuthService(userRepo, passwordEncoder)
```

**장점**:
- 코드만 보면 무슨 일이 일어나는지 한눈에 파악
- 문서 없이도 이해 가능
- 디버깅 쉬움

**단점**:
- 코드가 3~5배 길어짐
- 반복 코드 많음 (if err != nil)
- 생산성 낮음

---

### Spring: 관례 기반 개발 (Convention)

**에러 처리**:
```java
// GlobalExceptionHandler가 알아서 처리
User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new AuthenticationException(ErrorCode.INVALID_CREDENTIALS));
```

**트랜잭션**:
```java
@Transactional  // AOP가 알아서 처리
public User signup(...) {
    // 비즈니스 로직만
}
```

**의존성 주입**:
```java
@RequiredArgsConstructor  // Lombok + Spring이 알아서 처리
public class AuthService {
    private final UserRepository userRepository;
}
```

**장점**:
- 코드가 짧고 간결
- 비즈니스 로직에 집중
- 생산성 높음

**단점**:
- 내부 동작을 모르면 디버깅 어려움
- "왜 안 되지?" 순간이 많음
- 학습 곡선 높음

---

## "믿음의 개발" vs "명시적 개발"

### Spring: 믿음의 개발

```java
@Transactional
public void transfer(Account from, Account to, int amount) {
    from.withdraw(amount);
    to.deposit(amount);
    
    // "Spring아, 니가 알아서 해줘"
    // - 트랜잭션 시작
    // - 예외 시 롤백
    // - 성공 시 커밋
}
```

**개발자 마인드**:
- "Spring을 믿는다"
- "문서에 이렇게 하라고 했으니 되겠지"
- "내부 동작은 필요할 때만 파자"

### Go: 명시적 개발

```go
func transfer(from, to *Account, amount int) error {
    tx, err := db.Begin()  // 명시적 시작
    if err != nil {
        return err
    }
    defer tx.Rollback()  // 명시적 롤백 예약
    
    if err := from.Withdraw(tx, amount); err != nil {
        return err  // 명시적 에러 반환
    }
    
    if err := to.Deposit(tx, amount); err != nil {
        return err
    }
    
    return tx.Commit()  // 명시적 커밋
}
```

**개발자 마인드**:
- "코드가 곧 문서"
- "모든 것이 눈에 보인다"
- "마법 같은 건 없다"

---

## 실무 팁: Spring 개발 전략

### 1. 관례를 먼저 익히기

```java
// "이렇게 하면 되겠지?" 패턴 익히기
@RestController  // → RESTful API
@Service         // → 비즈니스 로직
@Repository      // → 데이터 접근
@Transactional   // → 트랜잭션 관리
@Autowired       // → 의존성 주입 (생성자 주입 권장)
```

### 2. 에러 메시지 읽기

```
에러 발생
  ↓
로그 확인
  ↓
"Could not autowire..." → Bean 등록 안 됨
"No qualifying bean..." → 같은 타입 Bean 여러 개
"TransactionRequiredException" → @Transactional 필요
  ↓
구글링 또는 문서 확인
```

### 3. 선택적 깊이 파기

**필수**:
- 어떻게 쓰는지 (How to use)
- 언제 쓰는지 (When to use)

**선택**:
- 내부 동작 (How it works)
- 왜 이렇게 설계했는지 (Why)

**예시**:
```java
passwordEncoder.matches(raw, encoded)

필수: "raw password와 encoded password 비교한다"
선택: "BCrypt가 salt를 어떻게 관리하는지"
```

---

## 구체적 예시: passwordEncoder.matches()

### 단계 1: 사용법 익히기 (필수)

```java
// 회원가입
String encoded = passwordEncoder.encode(password);
user.setPassword(encoded);

// 로그인
if (passwordEncoder.matches(inputPassword, user.getPassword())) {
    // 로그인 성공
}
```

**이 정도만 알아도 개발 가능**

### 단계 2: 문서 확인 (필요시)

```
공식 문서: "PasswordEncoder interface의 matches() 메서드는
          raw password와 encoded password를 비교합니다"
```

**"아, 비교만 하면 되는구나"**

### 단계 3: 내부 동작 파기 (궁금할 때)

```java
// BCryptPasswordEncoder 내부 코드
public boolean matches(CharSequence rawPassword, String encodedPassword) {
    // 1. encodedPassword에서 salt 추출
    // 2. rawPassword를 추출한 salt로 해싱
    // 3. 결과 비교
    return BCrypt.checkpw(rawPassword.toString(), encodedPassword);
}
```

**"오! BCrypt는 salt를 해시에 포함하는구나"**

---

## 결론

### Spring 개발 철학

1. **관례를 따르면 쉽다** (Convention over Configuration)
2. **문서를 믿는다** (Trust the Framework)
3. **내부는 선택이다** (Optional Deep Dive)

### 개발 프로세스

```
관례 학습 (20%) → 실전 개발 (80%)
    ↓                   ↓
문서/구글링         대부분 바로 동작
    ↓                   ↓
내부 동작 파악    에러 시에만 확인
(선택)              (20%)
```

### 트레이드오프

**Spring 선택 시**:
- ✅ 생산성 높음 (코드 짧음)
- ✅ 비즈니스 로직에 집중
- ⚠️ 학습 곡선 있음
- ⚠️ "마법" 이해 필요

**Go 선택 시**:
- ✅ 명시적 (이해 쉬움)
- ✅ 디버깅 쉬움
- ⚠️ 코드 길어짐
- ⚠️ 반복 코드 많음

### 당신의 질문에 대한 답

> "내부적으로 이런저런거 알아서 처리하겠거니 그냥 어느 정도 예상하고 문서를 찾아보는식으로 개발하는거라는 거지?"

**정답: 맞습니다!**

```
Spring 개발 = 관례(80%) + 문서(20%) + 내부 파악(선택)
```

**이게 Spring의 방식이고, 이게 정상입니다!** 😊
