# GlobalExceptionHandler 자동 연결의 비명시성

## 문제 상황

```java
// AuthService.java
if (userRepository.existsByEmail(email)) {
    throw new DuplicateEmailException(ErrorCode.DUPLICATE_EMAIL);
}
```

**어디에도 GlobalExceptionHandler를 호출하라는 코드가 없다.**

그런데도 마법처럼:
1. GlobalExceptionHandler가 실행되고
2. 올바른 @ExceptionHandler 메서드가 선택되고
3. 적절한 HTTP 응답이 반환된다

## 가장 답답한 부분

### 생성자에서 보이는 비명시성

```java
@Getter
public class DuplicateEmailException extends RuntimeException {
    private final ErrorCode errorCode;

    public DuplicateEmailException(ErrorCode errorCode) {
        super(errorCode.getMessage());  // ← 메시지만 상위 클래스로 전달
        this.errorCode = errorCode;      // ← ErrorCode는 필드에만 저장
    }
}
```

**관찰**:
- `super()`에는 메시지만 전달
- `errorCode`는 그냥 필드에 저장될 뿐
- **어디에도 GlobalExceptionHandler와의 연결 코드가 없음**

그런데도 GlobalExceptionHandler에서는:

```java
@ExceptionHandler(DuplicateEmailException.class)
public ResponseEntity<ErrorResponse> handleDuplicateEmailException(
        DuplicateEmailException e,  // ← 어떻게 여기로 왔지?
        HttpServletRequest request
) {
    ErrorResponse errorResponse = ErrorResponse.of(
            e.getErrorCode().getCode(),  // ← errorCode 필드를 멀쩡히 가져옴
            e.getMessage(),
            request.getRequestURI()
    );

    return ResponseEntity
            .status(e.getErrorCode().getHttpStatus())
            .body(errorResponse);
}
```

**질문**:
1. `DuplicateEmailException`이 어떻게 `GlobalExceptionHandler`로 전달되는가?
2. `e` 파라미터는 누가 주입하는가?
3. `request` 파라미터는 누가 넣어주는가?
4. 왜 `@ExceptionHandler(DuplicateEmailException.class)` 어노테이션만으로 연결되는가?

## 스프링의 "보이지 않는 흐름"

### 실제 내부 동작 (개발자가 보지 못하는 부분)

```
1. Controller에서 예외 발생
   ↓
2. DispatcherServlet이 catch
   ↓
3. HandlerExceptionResolver 체인 실행
   ↓
4. @RestControllerAdvice가 붙은 클래스들 스캔
   ↓
5. 발생한 예외 타입과 @ExceptionHandler 매칭
   ↓
6. Reflection으로 메서드 파라미터 분석
   ↓
7. 필요한 파라미터 자동 주입:
   - DuplicateEmailException e  ← 발생한 예외 객체
   - HttpServletRequest request ← 현재 요청 객체
   ↓
8. 메서드 실행 및 ResponseEntity 반환
```

### 코드에서 보이는 것 vs 실제 일어나는 일

| 개발자가 작성한 코드 | 실제로 Spring이 하는 일 |
|---------------------|------------------------|
| `throw new DuplicateEmailException(...)` | 1. 예외 객체 생성<br>2. DispatcherServlet으로 전파<br>3. HandlerExceptionResolver 실행<br>4. @RestControllerAdvice 클래스 스캔<br>5. @ExceptionHandler 메서드 탐색<br>6. 타입 매칭<br>7. Reflection으로 메서드 호출<br>8. 파라미터 자동 주입 |
| `@RestControllerAdvice` | 1. 컴포넌트 스캔<br>2. Bean 등록<br>3. HandlerExceptionResolver에 등록<br>4. 모든 Controller에 적용 |
| `@ExceptionHandler(DuplicateEmailException.class)` | 1. 예외 타입 매핑 저장<br>2. 메서드 시그니처 분석<br>3. 파라미터 타입 정보 캐싱 |

## Go 언어와 비교

### Go의 명시적 에러 처리

```go
// 서비스 레이어
func (s *AuthService) Signup(email, password, username string) (*User, error) {
    // 이메일 중복 체크
    exists, err := s.userRepo.ExistsByEmail(email)
    if err != nil {
        return nil, err
    }
    if exists {
        return nil, errors.New("duplicate email")  // ← 에러 반환
    }

    // ...
    return user, nil
}

// 컨트롤러 레이어
func (c *AuthController) SignupHandler(w http.ResponseWriter, r *http.Request) {
    user, err := c.authService.Signup(email, password, username)
    if err != nil {
        // ← 명시적으로 에러 처리
        if err.Error() == "duplicate email" {
            respondWithError(w, 409, "DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다")
            return
        }
        respondWithError(w, 500, "INTERNAL_ERROR", "서버 오류")
        return
    }

    respondWithJSON(w, 201, user)
}
```

**Go의 특징**:
- ✅ 에러 처리 흐름이 코드에 **명시적으로** 보임
- ✅ 어디서 어떻게 처리되는지 **직접** 확인 가능
- ✅ "마법" 없음
- ❌ 보일러플레이트 코드 많음
- ❌ 에러 처리 코드가 비즈니스 로직과 섞임

### Spring의 암묵적 에러 처리

```java
// 서비스 레이어
@Transactional
public User signup(String email, String password, String username) {
    if (userRepository.existsByEmail(email)) {
        throw new DuplicateEmailException(ErrorCode.DUPLICATE_EMAIL);  // ← 던지기만 함
    }
    // ...
}

// 컨트롤러 레이어
@PostMapping("/signup")
public ResponseEntity<UserResponse> signup(@RequestBody SignupRequest request) {
    User user = authService.signup(request.getEmail(), ...);
    return ResponseEntity.ok(UserResponse.from(user));
    // ← 에러 처리 코드가 없음!
}

// GlobalExceptionHandler (별도 파일)
@ExceptionHandler(DuplicateEmailException.class)
public ResponseEntity<ErrorResponse> handleDuplicateEmailException(...) {
    // ← 언제 어떻게 여기로 오는지 코드에서 안 보임
}
```

**Spring의 특징**:
- ✅ 비즈니스 로직이 깔끔함 (에러 처리 코드 분리)
- ✅ 중복 코드 제거 (한 곳에서 모든 에러 처리)
- ✅ 생산성 향상
- ❌ 에러 처리 흐름이 **보이지 않음**
- ❌ "마법" 같은 연결
- ❌ 내부 동작을 모르면 디버깅 어려움

## "스파게티 코드" 비유의 타당성

### 왜 "스파게티"처럼 느껴지는가?

**전통적인 스파게티 코드**:
```
A 함수 → (goto) → B 라벨
C 함수 → (goto) → D 라벨
E 함수 → (goto) → A 라벨
```
→ 코드 흐름이 여기저기 튀어서 추적 불가능

**Spring의 암묵적 연결**:
```
AuthService.signup()
    → throw DuplicateEmailException
    → (???)  ← 여기가 안 보임!
    → GlobalExceptionHandler.handleDuplicateEmailException()
```
→ 연결 고리가 코드에 없음

**공통점**:
- 코드만 봐서는 **실행 흐름을 추적할 수 없음**
- A → B로 가는 **명시적인 호출이 없음**

**차이점**:
- 전통적 스파게티: 무질서하고 예측 불가능
- Spring: **규칙은 있지만** 코드에 드러나지 않음

### "Convention"이라는 이름의 숨겨진 연결

Spring은 이것을 "Convention over Configuration"이라고 부르지만,
결국 **개발자가 명시하지 않은 연결이 자동으로 생긴다**는 점에서
"보이지 않는 스파게티"라고 볼 수 있다.

```java
// 내가 작성한 코드
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateEmailException(...) {
        // ...
    }
}
```

```java
// Spring이 내부적으로 하는 일 (코드에 안 보임)
public class DispatcherServlet {
    private void processHandlerException(Exception ex) {
        for (HandlerExceptionResolver resolver : this.exceptionResolvers) {
            ModelAndView mav = resolver.resolveException(request, response, handler, ex);
            if (mav != null) return;
        }
    }
}

public class ExceptionHandlerExceptionResolver {
    protected ModelAndView doResolveHandlerMethodException(Exception ex) {
        // 1. @RestControllerAdvice 빈 찾기
        // 2. @ExceptionHandler 메서드 매칭
        // 3. Reflection으로 메서드 호출
        // 4. 파라미터 자동 주입
    }
}
```

**개발자 입장**:
- "나는 그냥 `@ExceptionHandler` 붙였을 뿐인데..."
- "누가 언제 어떻게 호출하는지 모르겠어"
- "내가 시키지도 않은 일을 하고 있어"

## 이것이 "마법"인 이유

### 1. 선언만 했는데 실행된다

```java
@ExceptionHandler(DuplicateEmailException.class)
public ResponseEntity<ErrorResponse> handleDuplicateEmailException(...) {
    // 이 메서드를 호출하는 코드가 어디에도 없는데 실행됨
}
```

### 2. 파라미터가 자동으로 채워진다

```java
public ResponseEntity<ErrorResponse> handleDuplicateEmailException(
        DuplicateEmailException e,  // ← 누가 넣어줌?
        HttpServletRequest request   // ← 누가 넣어줌?
) {
    // ...
}
```

사용 가능한 파라미터들 (Spring이 자동 주입):
- `Exception` 및 하위 타입
- `HttpServletRequest`
- `HttpServletResponse`
- `WebRequest`
- `Principal`
- `Locale`
- 기타 등등...

**어디에도 이 파라미터들을 넣어주는 코드가 없다!**

### 3. 반환 타입이 자동으로 변환된다

```java
// 반환 타입 1: ResponseEntity
public ResponseEntity<ErrorResponse> handle(...) {
    return ResponseEntity.status(409).body(errorResponse);
}

// 반환 타입 2: 그냥 객체
public ErrorResponse handle(...) {
    return errorResponse;  // ← 자동으로 ResponseEntity로 변환됨
}

// 반환 타입 3: void + @ResponseStatus
@ResponseStatus(HttpStatus.CONFLICT)
public void handle(...) {
    // ← 자동으로 409 응답 생성
}
```

**모두 다르게 작동하는데, Spring이 알아서 처리한다.**

## 실제 연결 지점: Reflection과 AOP

Spring이 이런 "마법"을 구현하는 방법:

### 1. 컴포넌트 스캔 시점

```java
// Spring 내부 (단순화)
@Component
public class ExceptionHandlerBeanProcessor implements BeanPostProcessor {
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        if (bean.getClass().isAnnotationPresent(RestControllerAdvice.class)) {
            // 1. @ExceptionHandler 메서드 찾기
            for (Method method : bean.getClass().getMethods()) {
                if (method.isAnnotationPresent(ExceptionHandler.class)) {
                    ExceptionHandler annotation = method.getAnnotation(ExceptionHandler.class);
                    Class<?>[] exceptionTypes = annotation.value();

                    // 2. 매핑 정보 저장
                    for (Class<?> exceptionType : exceptionTypes) {
                        exceptionHandlerMap.put(exceptionType,
                            new HandlerMethodInfo(bean, method));
                    }
                }
            }
        }
        return bean;
    }
}
```

### 2. 예외 발생 시점

```java
// Spring 내부 (단순화)
public class HandlerExceptionResolver {
    public ModelAndView resolveException(Exception ex) {
        // 1. 예외 타입으로 핸들러 찾기
        Class<?> exceptionType = ex.getClass();
        HandlerMethodInfo handlerInfo = exceptionHandlerMap.get(exceptionType);

        if (handlerInfo != null) {
            // 2. Reflection으로 메서드 호출 준비
            Method method = handlerInfo.getMethod();
            Object bean = handlerInfo.getBean();

            // 3. 메서드 파라미터 분석
            Parameter[] parameters = method.getParameters();
            Object[] args = new Object[parameters.length];

            for (int i = 0; i < parameters.length; i++) {
                Class<?> paramType = parameters[i].getType();

                // 4. 파라미터 타입별로 자동 주입
                if (Exception.class.isAssignableFrom(paramType)) {
                    args[i] = ex;  // 예외 객체 주입
                } else if (paramType == HttpServletRequest.class) {
                    args[i] = request;  // 요청 객체 주입
                }
                // ... 기타 타입 처리
            }

            // 5. Reflection으로 메서드 실행
            Object result = method.invoke(bean, args);

            // 6. 반환 타입 처리 (ResponseEntity, 일반 객체 등)
            return convertToModelAndView(result);
        }

        return null;
    }
}
```

**핵심**:
- 개발자는 선언만 함 (`@ExceptionHandler`)
- Spring이 Reflection으로 **런타임에** 연결을 만듦
- 코드에는 호출 관계가 **전혀 보이지 않음**

## 왜 Spring은 이렇게 설계했을까?

### 명시적 방식의 문제점 (Spring 없이)

```java
// 모든 Controller에서 이런 코드를 작성해야 함
@PostMapping("/signup")
public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
    try {
        User user = authService.signup(request.getEmail(), ...);
        return ResponseEntity.ok(UserResponse.from(user));
    } catch (DuplicateEmailException e) {
        ErrorResponse error = new ErrorResponse("DUPLICATE_EMAIL", e.getMessage(), ...);
        return ResponseEntity.status(409).body(error);
    } catch (AuthenticationException e) {
        ErrorResponse error = new ErrorResponse("AUTHENTICATION_FAILED", e.getMessage(), ...);
        return ResponseEntity.status(401).body(error);
    } catch (Exception e) {
        ErrorResponse error = new ErrorResponse("INTERNAL_ERROR", "서버 오류", ...);
        return ResponseEntity.status(500).body(error);
    }
}

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    try {
        // ... 똑같은 에러 처리 코드 반복
    } catch (DuplicateEmailException e) {
        // ...
    } catch (AuthenticationException e) {
        // ...
    }
}

// 100개 엔드포인트면 100번 반복!
```

**문제점**:
- 중복 코드 엄청남
- 한 곳에서 에러 응답 형식 바꾸려면 100곳 수정
- 휴먼 에러 가능성 높음

### Spring 방식의 장점

```java
// Controller: 비즈니스 로직만
@PostMapping("/signup")
public ResponseEntity<UserResponse> signup(@RequestBody SignupRequest request) {
    User user = authService.signup(request.getEmail(), ...);
    return ResponseEntity.ok(UserResponse.from(user));
}

// GlobalExceptionHandler: 에러 처리만
@ExceptionHandler(DuplicateEmailException.class)
public ResponseEntity<ErrorResponse> handleDuplicateEmailException(...) {
    // 한 곳에서만 정의
}
```

**장점**:
- DRY (Don't Repeat Yourself)
- 관심사 분리 (Separation of Concerns)
- 유지보수 쉬움
- 생산성 향상

**대가**:
- 연결이 보이지 않음
- "마법" 같은 느낌
- 내부 동작 이해 필요
- 디버깅 어려움 (처음에는)

## 디버깅 시 어떻게 추적할까?

### IntelliJ IDEA의 도움

1. **Exception Breakpoint 설정**
   ```
   Run → View Breakpoints → Java Exception Breakpoints
   → DuplicateEmailException 추가
   ```

2. **Call Stack 확인**
   ```
   DuplicateEmailException.<init>()
     at AuthService.signup()
     at AuthController.signup()
     at ... (Spring 내부 프록시)
     at DispatcherServlet.doDispatch()
     at HandlerExceptionResolver.resolveException()
     at ExceptionHandlerExceptionResolver.doResolveHandlerMethodException()
     at GlobalExceptionHandler.handleDuplicateEmailException()  ← 여기!
   ```

3. **Spring의 내부 흐름 확인**
   - `DispatcherServlet.processHandlerException()` 에 브레이크포인트
   - `ExceptionHandlerExceptionResolver` 코드 읽기
   - Reflection 호출 지점 확인

### 로그로 확인

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateEmailException(
            DuplicateEmailException e,
            HttpServletRequest request
    ) {
        log.warn("🔴 GlobalExceptionHandler 실행됨!");
        log.warn("   예외 타입: {}", e.getClass().getName());
        log.warn("   에러 코드: {}", e.getErrorCode());
        log.warn("   요청 경로: {}", request.getRequestURI());

        // ...
    }
}
```

**실행 결과**:
```
🔴 GlobalExceptionHandler 실행됨!
   예외 타입: com.mapo.palantier.common.exception.DuplicateEmailException
   에러 코드: DUPLICATE_EMAIL
   요청 경로: /api/auth/signup
```

## 명시성 vs 생산성 트레이드오프

| 측면 | Go (명시적) | Spring (암묵적) |
|------|------------|----------------|
| **코드 가독성** | 흐름이 명확함 | 비즈니스 로직 집중 |
| **디버깅** | 쉬움 (코드 그대로) | 어려움 (내부 이해 필요) |
| **생산성** | 낮음 (반복 코드) | 높음 (자동화) |
| **러닝 커브** | 낮음 | 높음 (프레임워크 학습) |
| **유지보수** | 변경 시 여러 곳 수정 | 한 곳만 수정 |
| **보일러플레이트** | 많음 | 적음 |
| **제어권** | 개발자가 완전 제어 | 프레임워크가 제어 (IoC) |

## 결론: "매직"을 어떻게 받아들일 것인가?

### 1. Spring의 철학 이해하기

Spring은 **"제어의 역전(IoC)"** 철학을 기반으로 합니다:
- 개발자: "이런 상황에서 이렇게 처리해줘" (선언)
- Spring: "알겠어, 내가 알아서 할게" (실행)

이것은 **명령형(Imperative)** 에서 **선언형(Declarative)** 프로그래밍으로의 전환입니다.

### 2. 트레이드오프 인정하기

**명시성을 포기하는 대신**:
- ✅ 중복 코드 제거
- ✅ 유지보수성 향상
- ✅ 생산성 향상

**이것을 "좋다" 또는 "나쁘다"로 판단할 수 없습니다.**
- 프로젝트 규모
- 팀 구성
- 요구사항
에 따라 다릅니다.

### 3. 실무에서의 접근

대부분의 Spring 개발자는:

1. **처음 (주니어)**:
   - "왜 이게 되지?? 마법인가??"
   - "코드에 없는데 어떻게 실행되지?"
   - 답답함 느낌

2. **학습 후**:
   - "아, Spring이 내부적으로 이렇게 처리하는구나"
   - "Reflection과 Proxy로 구현했구나"
   - 내부 동작 이해

3. **숙련 후**:
   - "이 패턴은 Spring이 자동으로 해줄 거야"
   - Convention에 익숙해짐
   - 생산성에 집중

### 4. 당신의 관찰은 정당합니다

"매직을 넘어서 내가 시키지도 않은 일을 하는 느낌"

→ **맞습니다.** 실제로 당신이 명시하지 않은 연결이 자동으로 생깁니다.

이것을:
- "편리한 추상화"로 볼 수도 있고
- "보이지 않는 스파게티"로 볼 수도 있습니다

**두 관점 모두 타당합니다.**

## 대안: 명시적으로 만들 수 있을까?

Spring의 자동 연결을 피하고 싶다면:

```java
// GlobalExceptionHandler를 직접 주입받아 사용
@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final GlobalExceptionHandler exceptionHandler;  // 명시적 주입

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request,
                                     HttpServletRequest httpRequest) {
        try {
            User user = authService.signup(request.getEmail(), ...);
            return ResponseEntity.ok(UserResponse.from(user));
        } catch (DuplicateEmailException e) {
            // 명시적으로 호출
            return exceptionHandler.handleDuplicateEmailException(e, httpRequest);
        }
    }
}
```

**그런데 이렇게 하면**:
- 중복 코드 다시 발생
- Spring 쓰는 의미가 없어짐
- 차라리 Go 쓰는 게 나음

## 최종 정리

### Spring의 GlobalExceptionHandler는:

**장점**:
- ✅ 중복 코드 제거
- ✅ 관심사 분리
- ✅ 유지보수 용이
- ✅ 생산성 향상

**단점**:
- ❌ 연결이 보이지 않음
- ❌ "마법" 같은 동작
- ❌ 디버깅 어려움 (처음에는)
- ❌ 프레임워크 의존성

### 당신의 느낌은 정상입니다

"내가 시키지도 않은 일을 하는 느낌" → **맞습니다.**

Spring은 당신이 명시하지 않은 연결을 자동으로 만듭니다.

이것이:
- **편리한 추상화**인가?
- **보이지 않는 스파게티**인가?

→ **관점의 차이**입니다. 둘 다 맞습니다.

### 실무 선택

대부분의 Spring 프로젝트는:
- "명시성 < 생산성" 이므로
- GlobalExceptionHandler 방식 채택

하지만 당신의 비판은:
- ✅ 기술적으로 정확함
- ✅ 철학적으로 타당함
- ✅ 아키텍처적으로 의미 있음

**"불편하지만 효율적인 것"을 받아들이는 것도 엔지니어링의 일부입니다.**
