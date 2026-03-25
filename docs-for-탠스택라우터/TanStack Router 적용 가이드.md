# TanStack Router 적용 가이드

## 📅 적용 날짜
2026-03-23

## 🎯 적용 이유

### 기존 문제점 (수동 라우팅)
```tsx
// ❌ if 문으로 라우팅 처리
const renderPage = () => {
  if (currentPath === '/admin/users') {
    if (auth.user?.role === 'ROLE_ADMIN') {
      return <UsersPage />
    } else {
      redirectToDashboard()
      return <MainPage />
    }
  }
  // ... 80줄의 if 문
}
```

**문제:**
- 모든 경로를 if 문으로 하드코딩
- 권한 체크 로직 중복
- 수동 이벤트 리스너 관리
- 타입 안전성 부족 (경로 오타 가능)
- 확장성 문제 (새 페이지마다 if 문 추가)

### TanStack Router로 해결
- ✅ 선언적 라우트 정의
- ✅ 타입 안전한 네비게이션
- ✅ 권한 체크 로직 중앙화 (`beforeLoad`)
- ✅ 자동 코드 스플리팅
- ✅ 프리로드 지원 (hover 시)

## 📦 설치

```bash
cd parantier-front
npm install @tanstack/react-router
```

## 🏗️ 구조

### 파일 구조
```
parantier-front/src/
├── app/
│   └── routes/
│       └── index.tsx         (라우트 정의)
├── App.tsx                   (RouterProvider만)
├── widgets/
│   └── header/
│       └── Header.tsx        (Link 컴포넌트 사용)
└── pages/
    ├── main/MainPage.tsx
    └── admin/
        ├── users/UsersPage.tsx
        └── menus/MenusPage.tsx
```

## 🔧 구현

### 1. 라우트 정의 (src/app/routes/index.tsx)

```tsx
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from '@tanstack/react-router'
import { Header } from '@/widgets/header/Header'
import { MainPage } from '@/pages/main/MainPage'
import { UsersPage } from '@/pages/admin/users/UsersPage'
import { MenusPage } from '@/pages/admin/menus/MenusPage'
import { authStore } from '@/entities/user/model/authStore'
import { toast } from 'sonner'

// 권한 체크 헬퍼 (중앙화)
const requireAuth = (requiredRole?: string) => {
  const auth = authStore.state

  if (!auth.isAuthenticated) {
    toast.error('로그인이 필요합니다')
    throw redirect({ to: '/dashboard' })
  }

  if (requiredRole && auth.user?.role !== requiredRole) {
    toast.error('접근 권한이 없습니다', {
      description: '관리자 권한이 필요한 페이지입니다.',
    })
    throw redirect({ to: '/dashboard' })
  }
}

// Root Route (공통 레이아웃)
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />  {/* 자식 라우트 렌더링 */}
      </main>
    </div>
  ),
})

// 각 페이지 라우트
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MainPage,
})

const dashboardAliasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: MainPage,
})

// 관리자 전용 라우트 (beforeLoad로 권한 체크)
const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  beforeLoad: () => requireAuth('ROLE_ADMIN'),  // ✅ 권한 체크
  component: UsersPage,
})

const adminMenusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/menus',
  beforeLoad: () => requireAuth('ROLE_ADMIN'),
  component: MenusPage,
})

// 라우트 트리 생성
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  dashboardAliasRoute,
  adminUsersRoute,
  adminMenusRoute,
])

// Router 생성 및 export
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent', // 링크 hover 시 프리로드
})

// TypeScript 타입 선언 (자동완성 지원)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

### 2. App.tsx 간소화

**Before (97줄):**
```tsx
function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const auth = useStore(authStore, (state) => state)

  // ... 수동 이벤트 리스너 등록
  // ... 80줄의 if 문으로 라우팅

  return (/* ... */)
}
```

**After (22줄):**
```tsx
import { RouterProvider } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { authActions } from '@/entities/user/model/authStore'
import { router } from '@/app/routes'

function App() {
  // 앱 로드 시 로그인 상태 복원
  useEffect(() => {
    authActions.restoreAuth()
  }, [])

  return (
    <QueryProvider>
      <Toaster position="top-right" richColors closeButton duration={2000} />
      <RouterProvider router={router} />
    </QueryProvider>
  )
}

export default App
```

**개선:**
- ✅ 97줄 → 22줄 (75줄 감소, 77% 단순화)
- ✅ 복잡한 if 문 제거
- ✅ 수동 이벤트 리스너 제거
- ✅ 권한 체크 로직 중복 제거

### 3. Header 컴포넌트 (Link 사용)

**Before:**
```tsx
// ❌ 수동 네비게이션
const handleMenuClick = (e: React.MouseEvent, path: string) => {
  e.preventDefault()
  window.history.pushState({}, '', path)
  window.dispatchEvent(new Event('navigate'))
}

<a href={menu.path} onClick={(e) => handleMenuClick(e, menu.path)}>
  {menu.name}
</a>
```

**After:**
```tsx
import { Link } from '@tanstack/react-router'

// ✅ 선언적 네비게이션
<Link to={menu.path || '/'} className="...">
  {menu.name}
</Link>
```

**개선:**
- ✅ 수동 이벤트 핸들러 불필요
- ✅ 프리로드 자동 지원 (hover 시)
- ✅ 브라우저 기본 기능 유지 (우클릭, 중간 클릭)

## 📊 Before vs After 비교

| 항목 | Before | After |
|------|--------|-------|
| App.tsx 라인 수 | 97줄 | 22줄 |
| 라우팅 방식 | 명령형 (if 문) | 선언적 (라우트 트리) |
| 권한 체크 | 각 페이지마다 중복 | beforeLoad로 중앙화 |
| 타입 안전성 | ❌ 없음 (문자열) | ✅ 있음 (자동완성) |
| 이벤트 리스너 | 수동 관리 | 자동 관리 |
| 코드 스플리팅 | 수동 구현 필요 | 자동 지원 |
| 프리로드 | 불가능 | 자동 지원 (hover) |

## 🎯 타입 안전 네비게이션

### Before (오타 가능)
```tsx
// ❌ 런타임 에러
window.history.pushState({}, '', '/admin/userss')  // 오타!
```

### After (컴파일 타임 체크)
```tsx
import { useNavigate } from '@tanstack/react-router'

const navigate = useNavigate()

// ✅ TypeScript 에러 (자동완성 지원)
navigate({ to: '/admin/userss' })  // 컴파일 에러!

// ✅ 올바른 경로
navigate({ to: '/admin/users' })  // OK
```

## 🚀 고급 기능

### 1. 동적 파라미터 (확장 가능)
```tsx
// 사용자 상세 페이지 라우트
const userDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/$userId',  // 동적 파라미터
  component: ({ params }) => <UserDetail userId={params.userId} />,
})
```

### 2. 데이터 로딩 (확장 가능)
```tsx
const menusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/menus',
  beforeLoad: () => requireAuth('ROLE_ADMIN'),
  loader: async () => {
    // 페이지 진입 전 데이터 로드
    const menus = await fetchMenus()
    return { menus }
  },
  component: ({ useLoaderData }) => {
    const { menus } = useLoaderData()
    return <MenusPage menus={menus} />
  },
})
```

### 3. 검색 파라미터 (확장 가능)
```tsx
const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page ?? 1),
    pageSize: Number(search.pageSize ?? 20),
  }),
  component: ({ useSearch }) => {
    const { page, pageSize } = useSearch()
    return <UsersPage page={page} pageSize={pageSize} />
  },
})

// 사용: /admin/users?page=2&pageSize=50
```

### 4. 중첩 라우팅 (확장 가능)
```tsx
// 레이아웃 공유
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: () => requireAuth('ROLE_ADMIN'),
  component: () => (
    <div className="admin-layout">
      <AdminSidebar />
      <Outlet />  {/* 자식 라우트 */}
    </div>
  ),
})

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,  // 부모 지정
  path: '/users',  // 실제 경로: /admin/users
  component: UsersPage,
})
```

## 💡 Best Practices

### 1. 권한 체크는 beforeLoad에서
```tsx
// ✅ Good
const adminRoute = createRoute({
  beforeLoad: () => requireAuth('ROLE_ADMIN'),
  component: AdminPage,
})

// ❌ Bad (컴포넌트 내부에서 체크)
const AdminPage = () => {
  const auth = useAuth()
  if (auth.user?.role !== 'ROLE_ADMIN') {
    navigate({ to: '/' })
  }
  // ...
}
```

### 2. 라우트는 한 곳에서 관리
```tsx
// ✅ Good: src/app/routes/index.tsx에서 모든 라우트 관리
export const router = createRouter({ routeTree })

// ❌ Bad: 여러 파일에 분산
```

### 3. Link 컴포넌트 사용
```tsx
// ✅ Good
<Link to="/admin/users">Users</Link>

// ❌ Bad
<a href="/admin/users" onClick={handleClick}>Users</a>
```

## 🔍 디버깅

### Router DevTools (개발 모드)
```tsx
import { RouterProvider } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <TanStackRouterDevtools router={router} position="bottom-right" />
    </>
  )
}
```

## 📚 참고 자료

- [TanStack Router 공식 문서](https://tanstack.com/router)
- [Quick Start Guide](https://tanstack.com/router/latest/docs/quick-start)
- [Type Safety](https://tanstack.com/router/latest/docs/guide/type-safety)

## 🎯 다음 단계

1. **동적 라우팅 추가**
   - `/users/:id` (사용자 상세)
   - `/menus/:id` (메뉴 상세)

2. **데이터 로딩 통합**
   - TanStack Query + Router 연동
   - 페이지 진입 전 데이터 프리로드

3. **레이아웃 최적화**
   - 관리자 레이아웃 분리
   - 중첩 라우팅 활용

4. **에러 바운더리**
   - 라우트별 에러 처리
   - 404 페이지

## 📝 주의사항

### 브라우저 호환성
- 모던 브라우저만 지원 (ES6+)
- IE11 미지원

### 번들 크기
- TanStack Router: ~20KB (gzipped)
- React Router: ~25KB (gzipped)
- **경량화!**

### 마이그레이션 체크리스트
- [x] TanStack Router 설치
- [x] 라우트 정의 (src/app/routes/index.tsx)
- [x] App.tsx 간소화
- [x] Header Link 변경
- [ ] 동적 라우팅 추가 (필요 시)
- [ ] 데이터 로딩 통합 (필요 시)
- [ ] DevTools 추가 (개발 모드)

## ✅ 결론

**TanStack Router 적용으로:**
- ✅ 코드 라인 **77% 감소** (97줄 → 22줄)
- ✅ **타입 안전성** 확보
- ✅ **유지보수성** 대폭 향상
- ✅ **확장성** 확보 (동적 라우팅, 데이터 로딩)
- ✅ **개발자 경험** 개선 (자동완성, 에러 체크)

**압도적으로 깔끔해졌습니다!**
