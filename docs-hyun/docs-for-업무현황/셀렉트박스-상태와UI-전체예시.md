# SelectCommonCode - 상태와 UI 전체 예시

## 1. 전체 시나리오

**사용자 액션 → 상태 변화 → UI 반영**을 시간순으로 보여줍니다.

---

## 2. 초기 렌더링 (페이지 로드)

### 2.1 상태 초기화

```javascript
// SearchForm.jsx
const { control, setValue } = useForm({
  defaultValues: {
    termTypeCd: '',  // 📌 초기값: 빈 문자열
  }
})
```

**React Hook Form 내부 상태:**
```javascript
{
  termTypeCd: ''  // ← control.getValues('termTypeCd')
}
```

### 2.2 UI 렌더링

**SelectBox UI:**
```
┌─────────────────────┐
│ 선택          [▼]  │  ← value='' 이므로 "선택" 표시
└─────────────────────┘

options:
- { value: '', title: '선택' }       ← 현재 선택됨 (value='' 매칭)
- { value: '00', title: '일자제어' }
- { value: '1', title: '월자제어' }
- { value: '10', title: '년자제어' }
```

**화면 표시값:**
```
현재 값: (빈 값)
```

---

## 3. API 응답 (데이터 로드)

### 3.1 API 응답

```javascript
// API Response
{
  termTypeCd: "00",
  startDate: "2024-01-01",
  endDate: "2024-12-31"
}
```

### 3.2 useEffect 실행

```javascript
useEffect(() => {
  if (data) {
    const normalized = String(data.termTypeCd).padStart(2, '0')
    setValue('termTypeCd', normalized)  // "00"
  }
}, [data, setValue])
```

### 3.3 상태 업데이트

**React Hook Form 내부 상태:**
```javascript
{
  termTypeCd: '00'  // '' → '00' 변경
}
```

### 3.4 UI 자동 재렌더링

**SelectBox UI:**
```
┌─────────────────────┐
│ 일자제어      [▼]  │  ← value='00' 이므로 "일자제어" 표시
└─────────────────────┘

options:
- { value: '', title: '선택' }
- { value: '00', title: '일자제어' } ← 현재 선택됨 (value='00' 매칭)
- { value: '1', title: '월자제어' }
- { value: '10', title: '년자제어' }
```

**화면 표시값:**
```
현재 값: 00
```

---

## 4. 사용자 액션 (SelectBox 클릭)

### 4.1 드롭다운 열림

```
┌─────────────────────┐
│ 일자제어      [▲]  │
└─────────────────────┘
  ┌─────────────────┐
  │ 선택            │
  │ 일자제어    ✓   │ ← 현재 선택
  │ 월자제어        │
  │ 년자제어        │
  └─────────────────┘
```

### 4.2 사용자가 "월자제어" 선택

```
사용자 클릭: "월자제어"
```

### 4.3 onChange 핸들러 실행

```javascript
onChange={(value) => {
  field.onChange(value)  // "1"
  if (selectChange) selectChange(value)
}}
```

### 4.4 상태 업데이트

**React Hook Form 내부 상태:**
```javascript
{
  termTypeCd: '1'  // '00' → '1' 변경
}
```

### 4.5 UI 자동 재렌더링

**SelectBox UI:**
```
┌─────────────────────┐
│ 월자제어      [▼]  │  ← value='1' 이므로 "월자제어" 표시
└─────────────────────┘
```

**화면 표시값:**
```
현재 값: 01  ← padStart(2, '0')로 "1" → "01" 변환
```

---

## 5. 전체 코드 with 상태 추적

```jsx
import { useForm, useWatch } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import SelectCommonCode from './SelectCommonCode'

function SearchForm() {
  console.log('🔵 컴포넌트 렌더링 시작')

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. FORM 상태 초기화
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const { control, setValue, handleSubmit } = useForm({
    defaultValues: {
      termTypeCd: '',  // 📌 초기값
      startDate: '',
      endDate: '',
    }
  })

  console.log('📝 Form 초기화 완료')

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. API 데이터 로드
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const { data, isLoading } = useQuery({
    queryKey: ['searchCondition'],
    queryFn: async () => {
      console.log('🌐 API 호출 시작')
      const res = await fetch('/api/search/condition')
      const json = await res.json()
      console.log('✅ API 응답:', json)
      return json
    }
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. API 응답 → Form 상태 업데이트
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    if (data) {
      console.log('🔄 useEffect: API 데이터로 setValue 호출')

      if (data.termTypeCd != null) {
        const normalized = String(data.termTypeCd).padStart(2, '0')
        console.log(`  termTypeCd: "${data.termTypeCd}" → "${normalized}"`)
        setValue('termTypeCd', normalized)
      }

      setValue('startDate', data.startDate || '')
      setValue('endDate', data.endDate || '')

      console.log('✅ setValue 완료')
    }
  }, [data, setValue])

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. 현재 상태 추적 (화면 표시용)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const rawTermTypeCd = useWatch({ control, name: 'termTypeCd' })
  const displayValue = rawTermTypeCd && rawTermTypeCd !== ''
    ? String(rawTermTypeCd).padStart(2, '0')
    : ''

  console.log('📊 현재 상태:', {
    rawTermTypeCd,
    displayValue,
    formValue: control._formValues?.termTypeCd
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. 제출 핸들러
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const onSubmit = (formData) => {
    console.log('📤 폼 제출:', formData)
    // { termTypeCd: "00", startDate: "...", endDate: "..." }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. UI 렌더링
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isLoading) {
    return <div>로딩중...</div>
  }

  return (
    <div className="p-4 space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* SelectBox */}
        <div className="flex items-center gap-4">
          <label className="w-24 font-medium">기간 유형:</label>
          <SelectCommonCode
            name="termTypeCd"
            control={control}
            commClCd={['AS020']}
            filterCode="CODE_CD"
            filterValue={['']}
            allCheckBox={true}
            allCheckBoxObject={{ title: '선택', value: '' }}
          />
        </div>

        {/* 현재 값 표시 */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="w-24">현재 값:</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {displayValue || '(선택 안됨)'}
          </span>
        </div>

        {/* 디버깅: 내부 상태 표시 */}
        <div className="border-t pt-4 mt-4 text-xs text-gray-500">
          <div>내부 상태 (디버깅용):</div>
          <pre className="bg-gray-50 p-2 rounded mt-2">
{JSON.stringify({
  rawTermTypeCd,
  displayValue,
  formValue: control._formValues?.termTypeCd
}, null, 2)}
          </pre>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          검색
        </button>
      </form>
    </div>
  )
}

export default SearchForm
```

---

## 6. 상태 변화 타임라인

```
시간 →

[0ms] 컴포넌트 마운트
      ├─ useForm 초기화: { termTypeCd: '' }
      └─ UI: "선택" 표시

[100ms] API 요청 시작
        └─ isLoading: true

[500ms] API 응답 완료
        └─ data: { termTypeCd: "00" }

[501ms] useEffect 실행
        ├─ setValue('termTypeCd', '00')
        └─ Form 상태 업데이트: { termTypeCd: '00' }

[502ms] 재렌더링
        ├─ field.value: '00'
        ├─ UI: "일자제어" 표시
        └─ 화면 표시값: "00"

[5000ms] 사용자가 "월자제어" 클릭
         └─ onChange 핸들러 호출

[5001ms] onChange 실행
         ├─ field.onChange('1')
         └─ Form 상태 업데이트: { termTypeCd: '1' }

[5002ms] 재렌더링
         ├─ field.value: '1'
         ├─ UI: "월자제어" 표시
         └─ 화면 표시값: "01" (padStart)
```

---

## 7. 문제 상황별 상태 비교

### ✅ 정상 작동 (올바른 코드)

```javascript
const { control } = useForm({
  defaultValues: { termTypeCd: '' }  // ✅ 있음
})

useEffect(() => {
  if (data) {
    setValue('termTypeCd', data.termTypeCd)  // ✅ 호출
  }
}, [data, setValue])
```

**상태 흐름:**
```
초기: termTypeCd = ''
      ↓
API 응답: data.termTypeCd = "00"
      ↓
setValue: termTypeCd = '00'
      ↓
UI: "일자제어" ✅ 선택됨
```

### ❌ 문제 1: defaultValues 누락

```javascript
const { control } = useForm({
  // defaultValues 없음 ❌
})
```

**상태 흐름:**
```
초기: termTypeCd = undefined  ❌
      ↓
setValue: termTypeCd = '00'
      ↓
UI: "일자제어" 선택됨 (이후는 정상)
```

**문제점:**
- 초기 렌더링에서 field.value가 undefined
- options에 undefined 값이 없으므로 매칭 실패
- "선택" 표시 안됨, 빈 화면

### ❌ 문제 2: setValue 누락

```javascript
useEffect(() => {
  if (data) {
    // setValue 호출 안함 ❌
  }
}, [data, setValue])
```

**상태 흐름:**
```
초기: termTypeCd = ''
      ↓
API 응답: data.termTypeCd = "00"
      ↓
(setValue 호출 안됨) ❌
      ↓
UI: "선택" 그대로 유지 ❌
```

**문제점:**
- API 데이터가 Form 상태에 반영 안됨
- 계속 초기값 '' 유지
- 사용자가 수동으로 선택해야 함

### ❌ 문제 3: 타입 불일치

```javascript
// API 응답: data.termTypeCd = 0 (숫자)
setValue('termTypeCd', data.termTypeCd)  // 0 (숫자)

// options
[
  { value: '', title: '선택' },
  { value: '00', title: '일자제어' }  // 문자열 "00"
]
```

**상태 흐름:**
```
setValue: termTypeCd = 0 (숫자)
      ↓
field.value = 0
      ↓
options.find(opt => opt.value === 0)  ❌ 찾지 못함
      ↓
UI: 매칭 실패, 빈 화면
```

**해결:**
```javascript
const normalized = String(data.termTypeCd).padStart(2, '0')
setValue('termTypeCd', normalized)  // "00"
```

---

## 8. 핵심 포인트

### 8.1 상태의 흐름

```
API Data → setValue → React Hook Form State → field.value → UI
```

### 8.2 반드시 필요한 3가지

1. **defaultValues 설정**
   ```javascript
   useForm({ defaultValues: { termTypeCd: '' } })
   ```

2. **setValue 호출**
   ```javascript
   useEffect(() => {
     if (data) setValue('termTypeCd', data.termTypeCd)
   }, [data, setValue])
   ```

3. **타입/형식 일치**
   ```javascript
   // API 값 정규화
   const normalized = String(value).padStart(2, '0')
   ```

### 8.3 UI는 자동으로 반응

- `field.value`가 변경되면 자동 재렌더링
- `options`에서 `value`가 일치하는 항목 자동 선택
- React Hook Form의 `Controller`가 모두 처리

---

## 9. 실제 화면 흐름 (스크린샷 시뮬레이션)

### 단계 1: 초기 로딩

```
┌────────────────────────────────────┐
│  검색 폼                            │
├────────────────────────────────────┤
│                                    │
│  로딩중...                         │
│                                    │
└────────────────────────────────────┘
```

### 단계 2: API 응답 후 (자동 선택)

```
┌────────────────────────────────────┐
│  검색 폼                            │
├────────────────────────────────────┤
│  기간 유형:  ┌──────────────┐     │
│              │ 일자제어  [▼]│     │
│              └──────────────┘     │
│                                    │
│  현재 값: 00                       │
└────────────────────────────────────┘
```

### 단계 3: 사용자 클릭 (드롭다운)

```
┌────────────────────────────────────┐
│  검색 폼                            │
├────────────────────────────────────┤
│  기간 유형:  ┌──────────────┐     │
│              │ 일자제어  [▲]│     │
│              └──────────────┘     │
│              ┌──────────────┐     │
│              │ 선택         │     │
│              │ 일자제어  ✓  │     │
│              │ 월자제어     │     │
│              │ 년자제어     │     │
│              └──────────────┘     │
│                                    │
│  현재 값: 00                       │
└────────────────────────────────────┘
```

### 단계 4: 사용자가 "월자제어" 선택

```
┌────────────────────────────────────┐
│  검색 폼                            │
├────────────────────────────────────┤
│  기간 유형:  ┌──────────────┐     │
│              │ 월자제어  [▼]│     │
│              └──────────────┘     │
│                                    │
│  현재 값: 01                       │
└────────────────────────────────────┘
```

---

## 10. 요약

**핵심 메커니즘:**

1. **Form State** (`control`)가 모든 것의 중심
2. **setValue**로만 상태 변경 가능 (API 데이터 → Form)
3. **Controller**가 Form State → UI 자동 동기화
4. **useWatch**로 현재 상태 추적 (표시용)

**데이터 흐름:**
```
API → useEffect → setValue → Form State → field.value → UI
                                    ↓
                               useWatch → 화면 표시값
```

이제 상태와 UI의 전체 흐름이 명확하게 보이시나요?
