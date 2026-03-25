# React Child Object 렌더링 에러 해결

## 문제 상황

### 발생한 에러
```
Error: Objects are not valid as a React child (found: object with keys {code, minimum, type, inclusive, exact, message, path})
```

### 에러 발생 위치
```tsx
// SignupDialog.tsx - 에러가 발생한 코드
<p className="text-sm text-destructive">
  {field.state.meta.errors[0]}  {/* ❌ Zod 에러 객체를 직접 렌더링 */}
</p>
```

## 원인 분석

### Zod 에러 객체 구조
```typescript
interface ZodError {
  code: string
  minimum: number
  type: string
  inclusive: boolean
  exact: boolean
  message: string
  path: string[]
}
```

- `field.state.meta.errors[0]`는 **객체**이지 문자열이 아님
- React는 객체를 직접 렌더링할 수 없음

## 해결 방법

### 수정된 코드
```tsx
<p className="text-sm text-destructive">
  {String(field.state.meta.errors[0])}  {/* ✅ 문자열로 변환 */}
</p>
```

### 다른 해결 방법들
```tsx
// 방법 1: String() 함수 사용 (권장)
{String(field.state.meta.errors[0])}

// 방법 2: .toString() 메서드
{field.state.meta.errors[0].toString()}

// 방법 3: message 속성 직접 접근 (타입 확실할 때)
{field.state.meta.errors[0].message}

// 방법 4: JSON.stringify (디버깅용)
{JSON.stringify(field.state.meta.errors[0])}
```

## 적용된 모든 위치

```tsx
// 1. 이메일 필드
{field.state.meta.errors.length > 0 && field.state.meta.errorMap?.onSubmit ? (
  <p className="text-sm text-destructive">
    {String(field.state.meta.errors[0])}
  </p>
) : (
  <p className="text-xs text-muted-foreground">
    이메일 형식으로 입력해주세요
  </p>
)}

// 2. 사용자 이름 필드
{field.state.meta.errors.length > 0 && field.state.meta.errorMap?.onSubmit ? (
  <p className="text-sm text-destructive">
    {String(field.state.meta.errors[0])}
  </p>
) : (
  <p className="text-xs text-muted-foreground">
    2자 이상 50자 이하로 입력해주세요
  </p>
)}

// 3. 비밀번호 필드
{field.state.meta.errors.length > 0 && field.state.meta.errorMap?.onSubmit ? (
  <p className="text-sm text-destructive">
    {String(field.state.meta.errors[0])}
  </p>
) : (
  <p className="text-xs text-muted-foreground">
    8자 이상, 대/소문자, 숫자, 특수문자 포함
  </p>
)}

// 4. 비밀번호 확인 필드
{field.state.meta.errors.length > 0 && field.state.meta.errorMap?.onSubmit ? (
  <p className="text-sm text-destructive">
    {String(field.state.meta.errors[0])}
  </p>
) : (
  <p className="text-xs text-muted-foreground">
    비밀번호를 다시 입력해주세요
  </p>
)}
```

## 배운 점

1. **React 렌더링 규칙**
   - React는 문자열, 숫자, boolean, null, undefined만 직접 렌더링 가능
   - 객체는 `String()`, `.toString()`, 또는 특정 속성으로 변환 필요

2. **TanStack Form 에러 처리**
   - `field.state.meta.errors`는 객체 배열
   - 에러 메시지 표시 시 반드시 문자열 변환 필요

3. **타입 안전성**
   - `String()`은 null/undefined도 안전하게 처리
   - `.toString()`은 null/undefined에서 에러 발생 가능

## 참고 자료

- [React Error: Objects are not valid as a React child](https://react.dev/reference/react/createElement#creating-an-element-without-jsx)
- [TanStack Form Error Handling](https://tanstack.com/form/latest/docs/framework/react/guides/validation)
