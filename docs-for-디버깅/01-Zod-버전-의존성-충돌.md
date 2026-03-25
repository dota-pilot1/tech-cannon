# Zod 버전 의존성 충돌 해결

## 문제 상황

### 발생한 에러
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

### 원인
- **Zod v4**가 설치되었으나 `@tanstack/zod-form-adapter`는 **Zod v3**를 요구
- TanStack Zod Adapter가 아직 Zod v4를 지원하지 않음

## 해결 방법

### 1. Zod 버전 다운그레이드
```bash
npm install zod@^3 @tanstack/zod-form-adapter
```

### 2. 설치된 버전 확인
```json
{
  "dependencies": {
    "zod": "^3.23.8",
    "@tanstack/zod-form-adapter": "^0.41.0"
  }
}
```

## 배운 점

1. **어댑터/플러그인 호환성 확인 필수**
   - 메인 라이브러리를 업데이트할 때는 어댑터도 호환되는지 확인 필요
   - TanStack Zod Adapter는 아직 Zod v4를 지원하지 않음

2. **버전 고정 vs 범위 지정**
   - `^3.23.8`: 3.x 대의 최신 패치/마이너 버전 허용
   - 어댑터가 v4를 지원하기 전까지는 v3로 유지 필요

## 참고 자료

- [TanStack Zod Adapter 공식 문서](https://tanstack.com/form/latest/docs/framework/react/guides/validation#adapter-based-validation-zod)
- [Zod 버전 호환성](https://github.com/colinhacks/zod/releases)
