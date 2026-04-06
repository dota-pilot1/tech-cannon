# 권한 거부 UX 개선

## 현재 문제점

### 현재 상태 (스크린샷 참고)
```tsx
// App.tsx - 현재 구현
if (auth.user?.role === 'ROLE_ADMIN') {
  return <UsersPage />
} else {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-destructive">접근 권한이 없습니다.</p>
    </div>
  )
}
```

**문제점**:
1. 빈 화면에 에러 메시지만 표시되어 사용자 경험이 좋지 않음
2. 왜 접근이 거부되었는지 구체적인 정보가 없음
3. 사용자가 다음에 무엇을 해야 할지 안내가 없음
4. 시각적으로 너무 단조롭고 차가운 느낌

## 개선 방안

### 옵션 1: 전용 권한 거부 페이지 (추천)

더 친절하고 정보가 풍부한 페이지를 제공:

```tsx
// src/pages/error/UnauthorizedPage.tsx
export function UnauthorizedPage() {
  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new Event('navigate'))
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full p-8">
        <div className="text-center">
          {/* 아이콘 */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-destructive/10 mb-6">
            <svg
              className="h-12 w-12 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* 메시지 */}
          <h1 className="text-3xl font-bold mb-2">접근 권한이 없습니다</h1>
          <p className="text-muted-foreground mb-8">
            이 페이지는 관리자 권한이 필요합니다.
            <br />
            권한이 필요하신 경우 관리자에게 문의해주세요.
          </p>

          {/* 액션 버튼 */}
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              대시보드로 이동
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              이전 페이지로 돌아가기
            </Button>
          </div>

          {/* 추가 정보 */}
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              문의: admin@example.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**장점**:
- 사용자에게 명확한 정보 제공
- 다음 행동을 유도하는 CTA 버튼
- 시각적으로 친절하고 전문적
- 문의처 제공으로 해결 방법 안내

### 옵션 2: 모달/토스트 알림 + 리다이렉트

페이지 접근 시도 시 알림을 표시하고 자동으로 대시보드로 이동:

```tsx
// App.tsx
import { toast } from 'sonner'
import { useEffect } from 'react'

const renderPage = () => {
  if (currentPath === '/admin/users') {
    if (auth.user?.role === 'ROLE_ADMIN') {
      return <UsersPage />
    } else {
      // 권한 없음 알림 + 리다이렉트
      useEffect(() => {
        toast.error('접근 권한이 없습니다', {
          description: '이 페이지는 관리자 권한이 필요합니다.',
          duration: 3000,
        })

        setTimeout(() => {
          window.history.pushState({}, '', '/dashboard')
          window.dispatchEvent(new Event('navigate'))
        }, 1000)
      }, [])

      return <MainPage />
    }
  }
  // ...
}
```

**장점**:
- 즉각적인 피드백
- 사용자를 막다른 곳에 두지 않음
- 부드러운 사용자 경험

**단점**:
- useEffect 훅을 renderPage 내부에서 사용할 수 없음 (React 규칙 위반)
- 구조 변경 필요

### 옵션 3: 사이드바에서 미리 차단

권한이 없는 메뉴는 아예 표시하지 않거나 비활성화:

```tsx
// Sidebar.tsx
export function Sidebar({ headerMenuPath }: SidebarProps) {
  const { data: menus = [] } = useMenuTree()
  const auth = useStore(authStore, (state) => state)

  const sideMenus = menus
    .filter((menu) => menu.menuType === 'SIDE' && menu.parentId === currentHeaderMenu?.id)
    .filter((menu) => {
      // 권한 필터링
      if (!menu.requiredRole) return true
      if (menu.requiredRole === 'USER' && auth.user) return true
      if (menu.requiredRole === 'ADMIN' && auth.user?.role === 'ROLE_ADMIN') return true
      return false
    })

  // ...
}
```

**장점**:
- 권한 없는 페이지에 접근 시도 자체를 방지
- 가장 깔끔한 UX

**단점**:
- 직접 URL 입력으로 접근하는 경우 여전히 처리 필요
- 사용자가 어떤 메뉴가 존재하는지 알 수 없음

## 추천 구현 전략

**1단계: 사이드바 필터링 (옵션 3)**
- 권한이 없는 메뉴는 사이드바에서 숨김
- 사용자가 잘못된 경로에 접근할 가능성을 줄임

**2단계: 전용 권한 거부 페이지 (옵션 1)**
- 직접 URL 입력 등으로 접근한 경우를 대비
- 친절하고 정보가 풍부한 페이지 제공

**3단계: 라우팅 가드 추가**
```tsx
// App.tsx - 리팩토링
const requireAdmin = (Component: React.ComponentType) => {
  if (auth.user?.role === 'ROLE_ADMIN') {
    return <Component />
  }
  return <UnauthorizedPage />
}

const renderPage = () => {
  switch (currentPath) {
    case '/admin/users':
      return requireAdmin(UsersPage)
    case '/admin/menus':
      return requireAdmin(MenusPage)
    case '/dashboard':
      return <MainPage />
    default:
      return <MainPage />
  }
}
```

## 추가 고려사항

### 1. 비로그인 사용자 처리
현재는 로그인한 사용자의 권한만 체크하지만, 비로그인 사용자는 별도 처리:

```tsx
if (!auth.user) {
  return <LoginPromptPage />
}

if (auth.user.role !== 'ROLE_ADMIN') {
  return <UnauthorizedPage />
}
```

### 2. 권한 레벨별 메시지
- **비로그인**: "이 페이지를 보려면 로그인이 필요합니다."
- **USER 권한 부족**: "이 페이지는 관리자 권한이 필요합니다."
- **세션 만료**: "세션이 만료되었습니다. 다시 로그인해주세요."

### 3. 분석 추적
권한 거부 이벤트를 추적하여 사용자 행동 분석:

```tsx
useEffect(() => {
  // 분석 이벤트 전송
  analytics.track('access_denied', {
    page: currentPath,
    userRole: auth.user?.role,
    requiredRole: 'ADMIN',
  })
}, [])
```

## 구현 우선순위

1. **High Priority**: 전용 UnauthorizedPage 컴포넌트 생성
2. **Medium Priority**: 사이드바 메뉴 권한 필터링
3. **Low Priority**: 라우팅 가드 리팩토링
4. **Nice to have**: 분석 추적, 비로그인 사용자 별도 페이지

## 참고 디자인 예시

- [Vercel 403 Page](https://vercel.com/403)
- [GitHub 403 Page](https://github.com/403)
- [Tailwind UI Error Pages](https://tailwindui.com/components/marketing/sections/404-pages)
