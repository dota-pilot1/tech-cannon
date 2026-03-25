# TypeScript JSX 네임스페이스 에러 해결

## 문제 상황

### 에러 메시지
```
Cannot find namespace 'JSX'.ts(2503)
```

### 발생 위치
**파일**: `parantier-front/src/pages/admin/menus/MenusPage.tsx:16`

```tsx
const renderMenuRows = (menuList: Menu[], depth = 0): JSX.Element[] => {
  const rows: JSX.Element[] = []
  // ...
}
```

### 원인 분석

**TypeScript 5.x + verbatimModuleSyntax 조합 문제**

1. **tsconfig.app.json 설정**:
   ```json
   {
     "compilerOptions": {
       "jsx": "react-jsx",
       "verbatimModuleSyntax": true
     }
   }
   ```

2. **verbatimModuleSyntax의 역할**:
   - TypeScript 5.0에서 도입된 새로운 옵션
   - import/export 문을 있는 그대로 유지
   - 타입 전용 import는 반드시 `import type` 사용 강제
   - JSX 네임스페이스에 대한 접근을 제한

3. **JSX.Element vs ReactElement**:
   - `JSX.Element`: TypeScript 글로벌 네임스페이스에 정의된 타입
   - `ReactElement`: React 패키지에서 export하는 구체적인 타입
   - `verbatimModuleSyntax` 활성화 시 글로벌 네임스페이스 접근이 제한됨

## 해결 방법

### 방법 1: ReactElement 사용 (권장)

`JSX.Element` 대신 React의 `ReactElement` 타입을 직접 import하여 사용합니다.

**변경 전**:
```tsx
export function MenusPage() {
  const { data: menus = [], isLoading } = useMenuTree()

  const renderMenuRows = (menuList: Menu[], depth = 0): JSX.Element[] => {
    const rows: JSX.Element[] = []
    // ...
  }
}
```

**변경 후**:
```tsx
import type { ReactElement } from 'react'

export function MenusPage() {
  const { data: menus = [], isLoading } = useMenuTree()

  const renderMenuRows = (menuList: Menu[], depth = 0): ReactElement[] => {
    const rows: ReactElement[] = []
    // ...
  }
}
```

**장점**:
- ✅ TypeScript 5.x의 최신 모범 사례 준수
- ✅ 명시적인 타입 import로 의존성이 명확함
- ✅ 빌드 최적화에 유리 (Tree-shaking)
- ✅ `verbatimModuleSyntax` 옵션과 호환

### 방법 2: verbatimModuleSyntax 비활성화 (비권장)

tsconfig.app.json에서 해당 옵션을 끕니다.

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "verbatimModuleSyntax": false  // 또는 제거
  }
}
```

**단점**:
- ❌ TypeScript 5.x의 최신 기능 활용 불가
- ❌ 불필요한 import가 번들에 포함될 수 있음
- ❌ 타입 안전성이 약화됨

## React 타입 종류

### ReactElement vs ReactNode vs JSX.Element

```tsx
import type { ReactElement, ReactNode } from 'react'

// 1. ReactElement - 구체적인 React 엘리먼트
const element: ReactElement = <div>Hello</div>

// 2. ReactNode - 렌더링 가능한 모든 것 (더 넓은 타입)
const node: ReactNode = "Hello" // string도 가능
const node2: ReactNode = 42 // number도 가능
const node3: ReactNode = <div>Hello</div> // element도 가능
const node4: ReactNode = null // null/undefined도 가능

// 3. JSX.Element - TypeScript 글로벌 네임스페이스 타입
const jsx: JSX.Element = <div>Hello</div>
```

### 사용 가이드

| 타입 | 사용 시기 | 예시 |
|-----|---------|-----|
| `ReactElement` | JSX를 반환하는 함수의 반환 타입 | `function Component(): ReactElement` |
| `ReactNode` | children props 타입 | `function Wrapper({ children }: { children: ReactNode })` |
| `JSX.Element` | 레거시 코드, verbatimModuleSyntax 미사용 | 권장하지 않음 |

### 컴포넌트 함수 타입 예시

```tsx
import type { ReactElement, ReactNode } from 'react'

// ✅ 좋은 예: ReactElement 사용
function MyComponent(): ReactElement {
  return <div>Hello</div>
}

// ✅ 좋은 예: 배열 반환 시 ReactElement[]
function renderItems(): ReactElement[] {
  return items.map(item => <li key={item.id}>{item.name}</li>)
}

// ✅ 좋은 예: children props는 ReactNode
interface WrapperProps {
  children: ReactNode
}

function Wrapper({ children }: WrapperProps): ReactElement {
  return <div className="wrapper">{children}</div>
}

// ❌ 나쁜 예: JSX.Element 사용 (verbatimModuleSyntax 환경)
function BadComponent(): JSX.Element { // TS2503 에러 발생
  return <div>Hello</div>
}
```

## 실제 적용 사례

### MenusPage 컴포넌트

**파일**: `parantier-front/src/pages/admin/menus/MenusPage.tsx`

```tsx
import { useMenuTree } from '@/features/menu/hooks/useMenuTree'
import { Button } from '@/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import type { Menu } from '@/types/menu'
import type { ReactElement } from 'react' // ✅ 명시적 타입 import

export function MenusPage() {
  const { data: menus = [], isLoading } = useMenuTree()

  // ✅ ReactElement[] 사용
  const renderMenuRows = (menuList: Menu[], depth = 0): ReactElement[] => {
    const rows: ReactElement[] = []

    menuList.forEach((menu) => {
      rows.push(
        <TableRow key={menu.id}>
          <TableCell>
            <span style={{ paddingLeft: `${depth * 24}px` }}>
              {depth > 0 && '└ '}
              {menu.name}
            </span>
          </TableCell>
          {/* ... */}
        </TableRow>
      )

      if (menu.children && menu.children.length > 0) {
        rows.push(...renderMenuRows(menu.children, depth + 1))
      }
    })

    return rows
  }

  return (
    <div className="p-8">
      {/* ... */}
      <TableBody>{renderMenuRows(menus)}</TableBody>
      {/* ... */}
    </div>
  )
}
```

## TypeScript 설정 파일

### tsconfig.app.json

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2023",
    "useDefineForClassFields": true,
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,  // ⚠️ 이 옵션 때문에 JSX.Element 사용 불가
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,

    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

## 베스트 프랙티스

### 1. 항상 명시적 타입 import 사용

```tsx
// ✅ 좋음
import type { ReactElement, ReactNode, FC } from 'react'

// ❌ 나쁨 (verbatimModuleSyntax 환경)
// 글로벌 JSX 네임스페이스에 의존
```

### 2. 타입 전용 import는 import type 사용

```tsx
// ✅ 좋음 - 타입만 import
import type { Menu } from '@/types/menu'
import type { ReactElement } from 'react'

// ❌ 나쁨 - 런타임 코드로 혼동 가능
import { Menu } from '@/types/menu'
```

### 3. 컴포넌트 함수는 ReactElement 반환 타입 명시

```tsx
// ✅ 좋음 - 명시적 반환 타입
export function MyComponent(): ReactElement {
  return <div>...</div>
}

// ❌ 나쁨 - 암시적 반환 타입 (타입 추론에 의존)
export function MyComponent() {
  return <div>...</div>
}
```

### 4. children props는 ReactNode 사용

```tsx
// ✅ 좋음 - 더 유연한 타입
interface Props {
  children: ReactNode
}

// ❌ 나쁨 - 너무 제한적
interface Props {
  children: ReactElement
}
```

## 참고 자료

- [TypeScript 5.0 Release Notes - verbatimModuleSyntax](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#verbatimmodulesyntax)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example)
- [React Types Reference](https://react.dev/reference/react)

## 체크리스트

- ✅ `JSX.Element` 대신 `ReactElement` 사용
- ✅ `import type { ReactElement } from 'react'` 명시적 import
- ✅ 타입 전용 import는 `import type` 사용
- ✅ `verbatimModuleSyntax` 옵션 유지 (권장 설정)
- ✅ TypeScript 빌드 에러 해결 확인
