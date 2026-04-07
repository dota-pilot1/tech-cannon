# Frontend (parantier-front) 규칙

> 상세 내용: /docs/frontend-guide.md, /docs/architecture.md

## IMPORTANT

- **파일 기반 자동 라우팅 사용 안 함** → 반드시 src/app/routes/index.tsx에 수동 등록
- **API 경로에 /api 중복 금지** → baseURL에 이미 /api 포함됨
- **STOMP 사용 금지** → 순수 WebSocket만 사용 (usePureWebSocket)

## FSD 레이어 구조

```
src/
├── app/          ← 앱 초기화, 라우터, 전역 Provider
├── pages/        ← 라우트 단위 페이지 (조합만, 로직 없음)
├── features/     ← 기능 단위 (hooks, components, api)
├── entities/     ← 도메인 단위 (api, types, model/store)
└── shared/       ← 순수 공통 (ui, hooks, lib, api/axios)
```

## FSD 의존성 방향 (단방향)

```
pages → features → entities → shared
```

- 상위 레이어가 하위 레이어를 import ✅
- 하위 레이어가 상위 레이어를 import ❌
- 같은 레이어 간 cross-import ❌

## 새 기능 추가 시 파일 위치

| 추가할 것 | 위치 |
|-----------|------|
| 페이지 컴포넌트 | `pages/{domain}/{Domain}Page.tsx` |
| API 호출 함수 | `entities/{domain}/api/{domain}Api.ts` |
| 타입 정의 | `entities/{domain}/types/{domain}.ts` |
| TanStack Query 훅 | `features/{domain}/hooks/use{Domain}.ts` |
| 기능 전용 컴포넌트 | `features/{domain}/components/{Component}.tsx` |
| 전역 상태 (zustand) | `entities/{domain}/model/{domain}Store.ts` |
| 공통 UI 컴포넌트 | `shared/ui/{component}.tsx` |
| 공통 훅 | `shared/hooks/use{Hook}.ts` |

## 라우트 등록 절차

```typescript
// src/app/routes/index.tsx
import { MyPage } from '@/pages/mypage/MyPage'

const myPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mypage',
  beforeLoad: () => requireAuth(),
  component: MyPage,
})

const routeTree = rootRoute.addChildren([
  ...기존라우트,
  myPageRoute, // ← 반드시 추가
])
```

## REFERENCE

- 컴포넌트/훅 목록: /docs/frontend-guide.md
- WebSocket: /docs/websocket.md
