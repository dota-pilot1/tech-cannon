# CORS 및 Spring Security 인증 문제 해결

## 문제 상황

### 브라우저 콘솔 에러
```
Access to XMLHttpRequest at 'http://localhost:8080/api/auth/check-email?email=terecal@daum.net'
from origin 'http://localhost:5173' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.

net::ERR_FAILED
```

### 증상
- 이메일 중복 확인 버튼 클릭 시 API 호출 실패
- CORS 에러 발생
- 네트워크 탭에서 요청이 실패로 표시

## 원인 분석

### 1. CORS 설정은 되어 있었음
```java
// WebConfig.java - 이미 설정되어 있음
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:5174")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 2. 실제 문제: Spring Security 인증 설정
```java
// SecurityConfig.java - 문제가 있던 부분
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            // ✅ 회원가입/로그인은 허용
            .requestMatchers("/api/auth/signup", "/api/auth/login").permitAll()

            // ❌ /api/auth/check-email은 없음!
            // → 인증 필요한 엔드포인트로 분류됨

            .requestMatchers("/api/**").authenticated()  // 나머지는 인증 필요
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}
```

### 3. CORS vs 인증

#### CORS (Cross-Origin Resource Sharing)
- 브라우저의 보안 정책
- 다른 도메인에서 리소스 요청 시 체크
- OPTIONS preflight 요청으로 확인

#### Spring Security 인증
- 서버의 보안 정책
- 특정 엔드포인트에 접근 권한 체크
- JWT 토큰으로 인증

### 4. 에러 발생 과정

```
1. 브라우저: OPTIONS /api/auth/check-email (preflight)
   └─> CORS 설정 확인: ✅ 통과

2. 브라우저: GET /api/auth/check-email
   └─> Spring Security: 인증 필요? ❌ JWT 토큰 없음!
   └─> 응답: 401 Unauthorized

3. 브라우저: CORS 에러로 표시
   (실제로는 인증 실패인데 CORS 에러처럼 보임)
```

## 해결 방법

### SecurityConfig 수정
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        )
        .authorizeHttpRequests(auth -> auth
            // Actuator health endpoint
            .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()

            // Swagger UI
            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

            // ✅ Auth endpoints - 이메일 중복 체크 추가!
            .requestMatchers(
                "/api/auth/signup",
                "/api/auth/login",
                "/api/auth/check-email"  // ← 추가
            ).permitAll()

            // 나머지 Actuator endpoints
            .requestMatchers("/actuator/**").authenticated()

            // 나머지 API endpoints
            .requestMatchers("/api/**").authenticated()

            // 기타 모든 요청
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}
```

## 테스트 방법

### 1. 브라우저에서 직접 테스트
```javascript
// 브라우저 콘솔에서
fetch('http://localhost:8080/api/auth/check-email?email=test@example.com')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

### 2. curl로 테스트
```bash
# 이메일 중복 체크
curl -X GET "http://localhost:8080/api/auth/check-email?email=test@example.com"

# 응답 예시
# false (사용 가능) 또는 true (중복)
```

### 3. Swagger UI에서 테스트
```
http://localhost:8080/swagger-ui/index.html
→ Auth Controller
→ GET /api/auth/check-email
→ Try it out
```

## Spring Security 엔드포인트 설정 패턴

### 공개 엔드포인트 (permitAll)
```java
.requestMatchers(
    // 인증 관련
    "/api/auth/signup",
    "/api/auth/login",
    "/api/auth/check-email",
    "/api/auth/refresh-token",

    // 공개 리소스
    "/api/public/**",

    // 개발/모니터링
    "/actuator/health",
    "/swagger-ui/**",
    "/v3/api-docs/**"
).permitAll()
```

### 인증 필요 엔드포인트 (authenticated)
```java
.requestMatchers(
    "/api/users/**",
    "/api/projects/**",
    "/api/orders/**"
).authenticated()
```

### 역할 기반 엔드포인트 (hasRole)
```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
.requestMatchers("/api/manager/**").hasAnyRole("ADMIN", "MANAGER")
```

## CORS Preflight 요청

### Preflight란?
- 브라우저가 실제 요청 전에 보내는 OPTIONS 요청
- 서버가 CORS를 허용하는지 확인

### Spring Security와 Preflight
```java
// Spring Security가 자동으로 OPTIONS 요청 허용
http
    .csrf(csrf -> csrf.disable())  // CSRF 비활성화하면 OPTIONS도 자동 허용
```

### 수동으로 OPTIONS 허용 (필요한 경우)
```java
.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
```

## 주의사항

### 1. 엔드포인트 순서
```java
// ❌ 잘못된 순서 - 구체적인 것이 나중에
.requestMatchers("/api/**").authenticated()
.requestMatchers("/api/auth/check-email").permitAll()  // 무시됨!

// ✅ 올바른 순서 - 구체적인 것이 먼저
.requestMatchers("/api/auth/check-email").permitAll()
.requestMatchers("/api/**").authenticated()
```

### 2. 와일드카드 사용
```java
// 단일 경로
.requestMatchers("/api/auth/check-email").permitAll()

// 하위 경로 모두
.requestMatchers("/api/public/**").permitAll()

// 특정 메서드만
.requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
```

### 3. CORS vs Security 디버깅

#### CORS 문제일 때
```
Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy
```
→ `WebConfig`의 CORS 설정 확인

#### Security 문제일 때
```
401 Unauthorized
403 Forbidden
```
→ `SecurityConfig`의 `requestMatchers` 확인

## 회원가입 플로우의 보안

### 인증 불필요 엔드포인트
```java
// 회원가입 전 - 인증 토큰 없음
.requestMatchers(
    "/api/auth/signup",           // 회원가입
    "/api/auth/login",            // 로그인
    "/api/auth/check-email",      // 이메일 중복 체크 ← 이것!
    "/api/auth/check-username"    // 사용자명 중복 체크 (필요시)
).permitAll()
```

### 인증 필요 엔드포인트
```java
// 회원가입 후 - 인증 토큰 있음
.requestMatchers(
    "/api/auth/logout",           // 로그아웃
    "/api/auth/change-password",  // 비밀번호 변경
    "/api/users/me",              // 내 정보 조회
    "/api/users/profile"          // 프로필 수정
).authenticated()
```

## 배운 점

1. **CORS 에러가 항상 CORS 문제는 아님**
   - 401/403 에러도 브라우저에서 CORS 에러로 보일 수 있음
   - Network 탭에서 실제 응답 코드 확인 필요

2. **Spring Security 설정이 우선**
   - CORS 설정이 올바르더라도 Security에서 막으면 접근 불가
   - 공개 API는 반드시 `permitAll()` 설정

3. **회원가입 플로우 고려**
   - 회원가입 전 필요한 API는 모두 `permitAll()`
   - 이메일 중복 체크, 사용자명 중복 체크 등

## 참고 자료

- [Spring Security Reference](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html)
- [CORS on Spring](https://spring.io/guides/gs/rest-service-cors/)
- [Understanding CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
