# BCrypt `matches()` 함수 동작 원리

## 문제 인식

`passwordEncoder.matches(password, user.getPassword())`는 직관적이지 않은 함수입니다.

```java
// 현재 코드
if (!passwordEncoder.matches(password, user.getPassword())) {
    throw new IllegalArgumentException("이메일 또는 비밀번호가 일치하지 않습니다.");
}
```

더 직관적인 방식은 다음과 같을 것입니다:

```java
// 더 직관적인 방식 (실제로는 이렇게 하면 안됨)
String encodedInputPassword = passwordEncoder.encode(password);
if (!encodedInputPassword.equals(user.getPassword())) {
    throw new IllegalArgumentException("이메일 또는 비밀번호가 일치하지 않습니다.");
}
```

하지만 위 방식은 **작동하지 않습니다**. 왜일까요?

## BCrypt 해시 구조

BCrypt는 Salt를 해시 문자열 안에 함께 저장합니다.

```
$2a$10$N9qo8uLOickgx2ZMRZoMye7Ej1rBzH9bvF9X8Z2kL3mK4nO5pQ6
│  │  │                      │                                  │
│  │  │                      │                                  └─ 실제 해시 (31자)
│  │  │                      └──────────────────────────────────── Salt (22자)
│  │  └───────────────────────────────────────────────────────── Cost Factor (10)
│  └──────────────────────────────────────────────────────────── BCrypt 버전 (2a)
└─────────────────────────────────────────────────────────────── 식별자 ($)
```

### 구조 분해

1. **`$2a$`**: BCrypt 버전 식별자
2. **`10`**: Cost Factor (반복 횟수 = 2^10 = 1024번)
3. **`$N9qo8uLOickgx2ZMRZoMye`**: Salt (22자)
4. **`7Ej1rBzH9bvF9X8Z2kL3mK4nO5pQ6`**: 실제 해시 값 (31자)

## `matches()` 함수의 내부 동작

`passwordEncoder.matches(rawPassword, encodedPassword)`는 다음과 같이 동작합니다:

```java
public boolean matches(String rawPassword, String encodedPassword) {
    // 1. 저장된 해시에서 Salt 추출
    String salt = extractSalt(encodedPassword);

    // 2. 추출한 Salt로 입력 비밀번호 해싱
    String hashedInputPassword = hashWithSalt(rawPassword, salt);

    // 3. 두 해시 비교
    return hashedInputPassword.equals(encodedPassword);
}
```

### 단계별 설명

#### 1단계: Salt 추출

```java
// 저장된 해시
String storedHash = "$2a$10$N9qo8uLOickgx2ZMRZoMye7Ej1rBzH9bvF9X8Z2kL3mK4nO5pQ6";

// Salt 추출 (앞 29자)
String salt = storedHash.substring(0, 29);
// 결과: "$2a$10$N9qo8uLOickgx2ZMRZoMye"
```

#### 2단계: 입력 비밀번호를 같은 Salt로 해싱

```java
String rawPassword = "password123!";
String salt = "$2a$10$N9qo8uLOickgx2ZMRZoMye";

// 같은 Salt로 해싱
String hashedInput = BCrypt.hashpw(rawPassword, salt);
// 결과: "$2a$10$N9qo8uLOickgx2ZMRZoMye7Ej1rBzH9bvF9X8Z2kL3mK4nO5pQ6"
```

#### 3단계: 비교

```java
String storedHash = "$2a$10$N9qo8uLOickgx2ZMRZoMye7Ej1rBzH9bvF9X8Z2kL3mK4nO5pQ6";
String hashedInput = "$2a$10$N9qo8uLOickgx2ZMRZoMye7Ej1rBzH9bvF9X8Z2kL3mK4nO5pQ6";

return storedHash.equals(hashedInput); // true
```

## 왜 `encode()`로는 비교할 수 없는가?

```java
// 잘못된 방법
String rawPassword = "password123!";
String encoded1 = passwordEncoder.encode(rawPassword);
String encoded2 = passwordEncoder.encode(rawPassword);

System.out.println(encoded1);
// $2a$10$ABC...xyz

System.out.println(encoded2);
// $2a$10$DEF...uvw  <- 다른 해시!

System.out.println(encoded1.equals(encoded2));
// false
```

**이유**: `encode()`는 **매번 새로운 랜덤 Salt**를 생성하기 때문에, 같은 비밀번호라도 다른 해시가 생성됩니다.

## 올바른 비교 흐름

### 회원가입 시

```java
String rawPassword = "password123!";
String encodedPassword = passwordEncoder.encode(rawPassword);
// 결과: "$2a$10$RandomSaltHere...actualHashHere"

// DB에 저장
user.setPassword(encodedPassword);
userRepository.save(user);
```

### 로그인 시

```java
// 1. 사용자가 입력한 비밀번호
String inputPassword = "password123!";

// 2. DB에서 가져온 저장된 해시
String storedHash = user.getPassword();
// "$2a$10$RandomSaltHere...actualHashHere"

// 3. matches()로 비교
boolean isValid = passwordEncoder.matches(inputPassword, storedHash);

// matches() 내부 동작:
// 3-1. storedHash에서 Salt 추출: "$2a$10$RandomSaltHere"
// 3-2. 추출한 Salt로 inputPassword 해싱
// 3-3. 결과 해시와 storedHash 비교
```

## 설계 철학: 편리함 vs 직관성

### 명시적이지만 번거로운 방식

```java
// 이론적으로 더 명확한 방식 (실제로는 불가능)
String salt = extractSaltFromHash(user.getPassword());
String hashedInput = hashPasswordWithSalt(password, salt);
if (!hashedInput.equals(user.getPassword())) {
    throw new IllegalArgumentException("비밀번호 불일치");
}
```

### BCrypt가 선택한 방식

```java
// 함축적이지만 편리한 방식
if (!passwordEncoder.matches(password, user.getPassword())) {
    throw new IllegalArgumentException("비밀번호 불일치");
}
```

BCrypt는 **편리함을 택했습니다**:
- Salt 추출 로직을 내부에 숨김
- 개발자가 Salt를 직접 다룰 필요 없음
- 실수할 여지를 줄임
- 대신 함수의 동작이 함축적(implicit)이고 덜 직관적임

## 핵심 정리

1. **BCrypt는 Salt를 해시 안에 저장**합니다.
2. **`encode()`는 매번 새 Salt 생성** → 같은 비밀번호도 다른 해시
3. **`matches()`는 내부적으로**:
   - 저장된 해시에서 Salt를 추출
   - 입력 비밀번호를 같은 Salt로 해싱
   - 두 해시를 비교
4. 이는 **함축적인 로직**이지만, **편리성과 안전성**을 위한 설계입니다.

## 참고

- BCrypt 해시는 항상 60자입니다.
- Salt는 Base64로 인코딩되어 22자를 차지합니다.
- Cost Factor가 높을수록 해싱 시간이 기하급수적으로 증가합니다 (2^10 = 1024번 반복).
