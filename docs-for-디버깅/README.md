# 디버깅 문서 모음

회원가입 폼 구현 과정에서 발생한 주요 이슈들과 해결 방법을 정리한 문서입니다.

## 목차

### [01. Zod 버전 의존성 충돌](./01-Zod-버전-의존성-충돌.md)
**키워드**: `npm`, `dependency conflict`, `Zod v3 vs v4`, `@tanstack/zod-form-adapter`

**문제**: TanStack Zod Adapter가 Zod v4를 지원하지 않아 의존성 충돌 발생

**해결**: Zod를 v3로 다운그레이드

**배운 점**: 어댑터/플러그인 라이브러리 사용 시 버전 호환성 확인 필수

---

### [02. React Child Object 에러](./02-React-Child-Object-에러.md)
**키워드**: `React`, `rendering error`, `Objects are not valid as a React child`, `Zod error`

**문제**: Zod 에러 객체를 JSX에서 직접 렌더링하려고 해서 발생한 에러

**해결**: `String()` 함수로 에러 객체를 문자열로 변환

**배운 점**: React는 객체를 직접 렌더링할 수 없으며, 문자열 변환 필요

---

### [03. 검증 타이밍 UX 개선](./03-검증-타이밍-UX-개선.md)
**키워드**: `UX`, `form validation timing`, `onChange vs onSubmit`, `helper text`

**문제**: 사용자가 입력하기도 전에 에러 메시지가 표시되어 UX 저하

**해결**: 검증 시점을 `onChange`에서 `onSubmit`으로 변경, 평상시에는 헬퍼 텍스트 표시

**배운 점**: 폼 검증 타이밍이 사용자 경험에 큰 영향을 미침

---

### [04. 버튼 비활성화 문제](./04-버튼-비활성화-문제.md)
**키워드**: `button disabled`, `form validation`, `TanStack Form`, `errors state`

**문제**: 검증 모드를 `onSubmit`으로 변경했는데 버튼 disabled 조건은 여전히 `errors`를 체크해서 버튼이 비활성화됨

**해결**: 버튼 disabled 조건에서 `errors` 체크 제거

**배운 점**: 검증 모드와 UI 로직의 일관성 유지 필요

---

### [05. CORS 및 Spring Security 인증 문제](./05-CORS-및-Spring-Security-인증-문제.md)
**키워드**: `CORS`, `Spring Security`, `permitAll`, `authentication`, `preflight`

**문제**: 이메일 중복 체크 API 호출 시 CORS 에러 발생 (실제로는 Spring Security 인증 문제)

**해결**: SecurityConfig에서 `/api/auth/check-email` 엔드포인트를 `permitAll()`로 설정

**배운 점**: CORS 에러가 항상 CORS 설정 문제는 아니며, Spring Security 인증 문제일 수 있음

---

## 이슈 발생 시간순

```
1. Zod 버전 충돌 (npm install 시)
   ↓
2. React Child Object 에러 (폼 렌더링 시)
   ↓
3. 검증 타이밍 UX 문제 (사용자 피드백)
   ↓
4. 버튼 비활성화 문제 (검증 모드 변경 후)
   ↓
5. CORS/Security 인증 문제 (API 호출 시)
```

## 주요 학습 포인트

### 프론트엔드
- TanStack Form + Zod 통합 방법
- 폼 검증 타이밍과 UX의 관계
- React 렌더링 규칙 (객체 vs 문자열)
- 버튼 disabled 조건 설정

### 백엔드
- Spring Security 엔드포인트 설정
- CORS vs 인증 문제 구분
- 공개 API 설정 (`permitAll()`)

### 디버깅
- 의존성 충돌 해결
- 에러 메시지 분석
- 브라우저 개발자 도구 활용
- 네트워크 탭에서 실제 응답 코드 확인

## 적용된 최종 코드

### 프론트엔드
- [`SignupDialog.tsx`](../parantier-front/src/features/auth/signup/SignupDialog.tsx)
- [`auth.schema.ts`](../parantier-front/src/shared/lib/validation/auth.schema.ts)
- [`authApi.ts`](../parantier-front/src/entities/user/api/authApi.ts)

### 백엔드
- [`SecurityConfig.java`](../parantier-api/src/main/java/com/mapo/palantier/config/SecurityConfig.java)
- [`AuthController.java`](../parantier-api/src/main/java/com/mapo/palantier/user/presentation/AuthController.java)
- [`AuthService.java`](../parantier-api/src/main/java/com/mapo/palantier/user/application/AuthService.java)

## 참고 문서

### 구현 가이드
- [중복 체크 및 유효성 검사 구현](../docs-for-프로젝트%20관리/uiux%20구현/중복%20체크%20및%20유효성%20검사%20구현.md)

### 공식 문서
- [TanStack Form](https://tanstack.com/form/latest)
- [Zod](https://zod.dev)
- [Spring Security](https://docs.spring.io/spring-security/reference/)
