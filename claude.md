# Palantier 프로젝트 개발 가이드

## 해커톤 기능 구현 현황

### 구현 완료 (Phase 1~3)
- **라우트**: `/hackathon` (메뉴 id: 55, HEADER 타입)
- **페이지**: `parantier-front/src/pages/hackathon/HackathonPage.tsx`
- **프론트 features**: `parantier-front/src/features/hackathon/`
  - `types/hackathon.types.ts` — 15개 타입 인터페이스
  - `api/hackathonApi.ts` — REST API 모듈
  - `hooks/useHackathon.ts` — TanStack Query 훅 (링크/Task/Issue/FAQ CRUD)
  - `hooks/useHackathonChat.ts` — WebSocket 채팅 훅
- **백엔드**: `parantier-api/src/main/java/com/mapo/palantier/hackathon/`
  - domain, dto, infrastructure, application, presentation 패키지 구성
  - WebSocket: `PureWebSocketHandler`에 `hackathon-chat/{eventId}` 토픽 추가

### DB 테이블 (로컬 + EC2 모두 생성 완료)
```
hackathon_events        — 해커톤 이벤트 (is_active로 현재 이벤트 구분)
hackathon_teams         — 팀 정보 (color_theme: blue|emerald|violet)
hackathon_team_members  — 팀 멤버 (users 테이블 참조)
hackathon_chat_messages — 오픈 채팅 메시지
hackathon_team_links    — 링크 (link_type: figma|github|custom)
hackathon_team_tasks    — Task (status: TODO|DOING|DONE)
hackathon_team_issues   — 이슈 (priority: HIGH|MEDIUM|LOW, status: OPEN|IN_PROGRESS|CLOSED)
hackathon_team_faq      — Q&A
```

### 백엔드 API 엔드포인트
```
GET  /api/hackathon/events/active          — 현재 진행중 이벤트 + 팀 + 멤버 조회
GET  /api/hackathon/events                 — 전체 이벤트 목록
POST /api/hackathon/events                 — 이벤트 생성 (ADMIN)
PUT  /api/hackathon/events/{id}            — 이벤트 수정 (ADMIN)

GET  /api/hackathon/events/{eventId}/chat  — 채팅 히스토리 (?limit=50)
WS   hackathon-chat/{eventId}              — 실시간 채팅 토픽

GET/POST        /api/hackathon/teams/{teamId}/links
DELETE          /api/hackathon/teams/{teamId}/links/{linkId}
GET/POST        /api/hackathon/teams/{teamId}/tasks
PUT/DELETE      /api/hackathon/teams/{teamId}/tasks/{taskId}
GET/POST        /api/hackathon/teams/{teamId}/issues
PUT             /api/hackathon/teams/{teamId}/issues/{issueId}
GET/POST        /api/hackathon/teams/{teamId}/faq
PUT/DELETE      /api/hackathon/teams/{teamId}/faq/{faqId}
POST            /api/hackathon/teams/{teamId}/members
DELETE          /api/hackathon/teams/{teamId}/members/{userId}
```

### 이벤트 초기 데이터 등록 방법 (DB 직접 삽입)
```bash
# 로컬: 이벤트 생성 예시
docker exec -i palantier-postgres psql -U palantier_user -d palantier -c \
  "INSERT INTO hackathon_events (title, description, start_at, end_at, max_teams, is_active) \
   VALUES ('2024 사내 해커톤', '48시간 해커톤', NOW(), NOW() + INTERVAL '48 hours', 2, true);"

# 팀 생성 예시 (event_id는 위에서 생성된 id)
docker exec -i palantier-postgres psql -U palantier_user -d palantier -c \
  "INSERT INTO hackathon_teams (event_id, name, project, color_theme, order_num) \
   VALUES (1, 'Team A', 'AI 코드 리뷰 어시스턴트', 'blue', 0), \
          (1, 'Team B', '실시간 협업 화이트보드', 'emerald', 1);"
```

### 팀 색상 테마
| colorTheme | 색상 |
|------------|------|
| `blue` | 파랑 (Team A 기본) |
| `emerald` | 초록 (Team B 기본) |
| `violet` | 보라 |

### WebSocket 채팅 토픽 구조
```json
// 구독/전송
{ "type": "SUBSCRIBE", "topic": "hackathon-chat/1", "data": {} }
{ "type": "CHAT", "topic": "hackathon-chat/1", "data": { "senderId": 1, "senderName": "홍길동", "message": "안녕!", "eventId": 1 } }
```

---

## 배포

> 📁 **배포에 관한 모든 기본 방침은 `/Users/terecal/mapo-palantier-project/배포 가이드` 를 따릅니다.**
> 배포 관련 작업 시 해당 디렉토리의 문서를 우선 참고하세요.

**⚡ 권장: GitHub Actions 자동 배포**
```bash
# 코드 변경 후 커밋/푸시만 하면 자동 배포
git add -A
git commit -m "feat: 새 기능"
git push
```

> ⚠️ **GitHub Actions 트리거 조건**
> - `parantier-front/**` 경로 변경 시 → 프론트 배포 자동 실행
> - `parantier-api/**` 경로 변경 시 → 백엔드 배포 자동 실행
> - 해당 경로 변경이 없으면 Actions가 트리거되지 않음 → 수동 배포 필요

### 프론트 수동 배포 (GitHub Actions 미트리거 시)
```bash
cd parantier-front
npm ci
VITE_API_URL=https://api.dxline-tallent.com/api \
VITE_WS_URL=wss://api.dxline-tallent.com/ws \
npm run build

# S3 업로드 + CloudFront 캐시 무효화
aws s3 sync dist/ s3://dxline-tallent-front --delete
aws cloudfront create-invalidation \
  --distribution-id E11NF3HMOB52NI \
  --paths "/*"
```

> ✅ CloudFront 캐시 무효화는 GitHub Actions 워크플로우에 이미 포함되어 있음
> (`.github/workflows/deploy-frontend.yml` - `Invalidate CloudFront cache` 스텝)

**배포 가이드 문서:**
- [GitHub Actions 배포](/배포 가이드/GitHub_Actions_배포.md): ⭐ 자동 배포 (권장)
- [배포 가이드](/배포 가이드/배포_가이드.md): 수동 배포 절차
- [빠른 참조](/배포 가이드/빠른_참조.md): 자주 사용하는 명령어
- [트러블슈팅 이력](/배포 가이드/트러블슈팅_이력.md): 문제 해결 사례
- [AWS 인프라 정보](/배포 가이드/AWS_인프라_정보.md): 서버 정보
- [GitHub Secrets](/배포 가이드/GITHUB_SECRETS.md): 환경 변수 설정

**수동 배포 (긴급 시):**
```bash
# 전체 배포 스크립트
./deploy-all.sh
```

## 데이터베이스 관리 원칙

### ⚠️ 중요: DB 변경 작업 원칙

**테이블 생성/수정은 로컬 및 EC2 DB에 직접 SQL을 실행하는 것이 원칙입니다**

- **Flyway 마이그레이션은 EC2 서버의 `application.yml`에 Flyway 설정이 없어서 자동 실행되지 않습니다**
- Flyway 마이그레이션 파일(`Vxx__xxx.sql`)은 히스토리/참고용으로만 유지합니다
- 모든 스키마 변경(테이블 생성/수정/삭제)은 **로컬과 EC2 DB에 직접 SQL을 실행**해야 합니다
- 로컬은 Docker 컨테이너, EC2는 SSH로 직접 psql 실행

#### 로컬 DB 직접 실행
```bash
# Docker 컨테이너 경유
docker exec -i palantier-postgres psql -U palantier_user -d palantier -c "SQL문"

# 또는 포트 포워딩 경유
PGPASSWORD=palantier_password psql -h localhost -U palantier_user -d palantier -c "SQL문"
```

#### EC2 DB 직접 실행 (배포 서버)
```bash
ssh -i "/Users/terecal/mapo-palantier-project/배포 가이드/hibot-d-server-key.pem" ubuntu@43.200.241.26 \
  "PGPASSWORD=palantier_password psql -h localhost -U palantier_user -d palantier -c \"SQL문\""
```

#### 새 테이블 추가 시 작업 순서
1. `db/migration/Vxx__설명.sql` 파일 생성 (히스토리용)
2. 로컬 Docker DB에 직접 SQL 실행
3. EC2 DB에 직접 SQL 실행 (위 명령어 사용)
4. 백엔드 코드 작성 후 커밋/푸시/배포

### 데이터베이스 접속 정보

**Docker 컨테이너 정보:**
```bash
Container Name: palantier-postgres
Image: postgres:16
```

> ✅ **로컬 DB는 Docker 컨테이너(`palantier-postgres`)를 사용합니다.**
> - 컨테이너가 `localhost:5432`로 포트 포워딩되어 있어서, `psql -h localhost`로 접속해도 실제론 Docker 컨테이너 DB에 연결됩니다.
> - 아래 두 가지 방법 모두 동일한 DB에 접속합니다.
>
> **로컬 접속 방법 (둘 다 동일):**
> ```bash
> # 방법 1: docker exec (컨테이너 직접)
> docker exec -i palantier-postgres psql -U palantier_user -d palantier
>
> # 방법 2: psql -h localhost (포트 포워딩 경유, 결과 동일)
> PGPASSWORD=palantier_password psql -h localhost -U palantier_user -d palantier
> ```
>
> **서버 접속 (EC2 호스트에 직접 설치된 PostgreSQL):**
> ```bash
> PGPASSWORD=palantier_password psql -h localhost -p 5432 -U palantier_user -d palantier
> ```

**접속 정보:**
```bash
Host: localhost
Port: 5432
Database: palantier
Username: palantier_user
Password: palantier_password
```

**Docker를 통한 접속:**
```bash
# psql 접속
docker exec -i palantier-postgres psql -U palantier_user -d palantier

# SQL 직접 실행
docker exec -i palantier-postgres psql -U palantier_user -d palantier -c "SELECT * FROM users;"
```

### compose.yaml 설정
```yaml
services:
  postgres:
    image: 'postgres:16'
    container_name: palantier-postgres
    environment:
      - 'POSTGRES_DB=palantier'
      - 'POSTGRES_USER=palantier_user'
      - 'POSTGRES_PASSWORD=palantier_password'
    ports:
      - '5432:5432'
```

## 프로젝트 구조

### Backend (parantier-api)
- Spring Boot 4.0.4
- MyBatis
- PostgreSQL
- JWT 인증

**패키지 구조 원칙:**
```
com.mapo.palantier          ← 모든 코드는 이 패키지 아래에 위치
├── menu                     ← 메뉴 관리
├── user                     ← 사용자 관리
├── organization             ← 조직 관리
├── role                     ← 역할 관리
├── authority                ← 권한 관리
├── task                     ← 업무 관리
│   ├── folder
│   ├── post
│   ├── comment
│   └── block
├── config                   ← 설정
└── common                   ← 공통 유틸리티
```

**중요 원칙:**
- ✅ **반드시** `com.mapo.palantier` 패키지 아래에 모든 코드 작성
- ✅ Spring Boot 기본 컴포넌트 스캔 활용 (추가 설정 불필요)
- ❌ `@ComponentScan`, `@MapperScan` 명시적 설정 금지
- ❌ 다른 루트 패키지(`com.palantier` 등) 사용 금지

**이유:**
- Spring Boot는 메인 클래스(`@SpringBootApplication`)의 패키지를 루트로 자동 스캔
- 명시적 스캔 설정은 유지보수 복잡도 증가
- 패키지 구조 일관성 유지

### Frontend (parantier-front)
- React + TypeScript
- TanStack Router
- TanStack Query
- Vite

#### 라우팅 방식

**⚠️ 중요: 이 프로젝트는 수동 라우트 등록 방식을 사용합니다**

파일 위치: `parantier-front/src/app/routes/index.tsx`

**라우트 작동 방식**:
- 파일 기반 라우팅(file-based routing) 사용 **안 함**
- `src/routes/` 폴더에 파일을 만들어도 자동으로 라우트가 생성되지 **않음**
- 반드시 `src/app/routes/index.tsx`에 수동으로 등록해야 함

**새 페이지 추가 시 절차**:
1. 페이지 컴포넌트 작성 (예: `src/pages/profile/ProfilePage.tsx`)
2. `src/app/routes/index.tsx`에 import 추가
3. `createRoute`로 라우트 생성
4. `routeTree.addChildren([...])` 배열에 추가

**예시**:
```typescript
// 1. Import
import { ProfilePage } from '@/pages/profile/ProfilePage'

// 2. Route 생성
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: () => requireAuth(),  // 로그인 필요 시
  component: ProfilePage,
})

// 3. routeTree에 추가
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  // ... 기존 라우트들
  profileRoute,  // ⭐ 반드시 여기에 추가해야 함
])
```

**권한 제어**:
```typescript
// ROLE_ADMIN만 접근 가능
const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  beforeLoad: () => requireRole('ROLE_ADMIN'),
  component: UsersPage,
})

// 로그인 필요
const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  beforeLoad: () => requireAuth(),
  component: ChatPage,
})
```

**주의사항**:
- `/src/routes/` 폴더에 파일을 생성해도 라우트가 자동으로 작동하지 않음
- 반드시 `index.tsx`에 수동 등록 필요
- 등록하지 않으면 "Not Found" 에러 발생

## 권한 시스템

### Role vs Authority
- **Role**: 사용자의 신분 (USER, ADMIN)
- **Authority**: 세밀한 권한 (USER:READ, MENU:WRITE 등)

### Authority 명명 규칙
```
CATEGORY:RESOURCE:ACTION
예: USER:READ, MENU:ADMIN:WRITE, AUTHORITY:READ
```

## 주요 엔드포인트

### Backend
```
http://localhost:8080
```

### Frontend
```
http://localhost:5173
```

## 개발 환경 실행

### ⚠️ 절대 규칙: 서버 시작/중지는 사용자가 직접 수행

- **Claude는 절대로 백엔드 서버를 시작(`bootRun`, `nohup` 등)하거나 중지(`kill`)하지 않습니다**
- **Claude는 절대로 프론트엔드 서버를 시작(`npm run dev`)하지 않습니다**
- 서버 재시작이 필요한 경우 → 사용자에게 "서버를 재시작해주세요" 라고 안내만 합니다
- 포트 충돌, 프로세스 확인 등 서버 상태 조회(`lsof`, `ps`) 도 하지 않습니다
- 백그라운드 실행(`&`, `nohup`) 절대 금지

**안내 방법 예시:**
```
백엔드 서버를 재시작해주세요.
cd parantier-api && ./gradlew bootRun
```

### Backend
```bash
cd parantier-api
./gradlew bootRun
```

### Frontend
```bash
cd parantier-front
npm run dev
```

## 공통 컴포넌트 참고

### UI 컴포넌트

#### shadcn/ui 컴포넌트
프로젝트에서 사용하는 shadcn/ui 컴포넌트들은 다음 경로에 있습니다:

**위치**: `parantier-front/src/shared/ui/`

**사용 가능한 컴포넌트**:
- `button.tsx` - 버튼 컴포넌트
- `dialog.tsx` - 다이얼로그/모달
- `alert-dialog.tsx` - 확인/취소 다이얼로그
- `input.tsx` - 입력 필드
- `checkbox.tsx` - 체크박스
- `select.tsx` - 셀렉트 박스
- `context-menu.tsx` - 우클릭 컨텍스트 메뉴
- `dropdown-menu.tsx` - 드롭다운 메뉴
- 기타 shadcn/ui 컴포넌트들

**사용 방법**:
```typescript
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/shared/ui/dialog'
import { AlertDialog, AlertDialogContent } from '@/shared/ui/alert-dialog'
```

**새 컴포넌트 추가**:
```bash
cd parantier-front
npx shadcn@latest add [component-name]
```

#### 커스텀 훅

**위치**: `parantier-front/src/shared/hooks/`

**사용 가능한 훅**:
- `useConfirm.tsx` - 공통 확인 다이얼로그 훅

**사용 방법**:
```typescript
import { useConfirm } from '@/shared/hooks/useConfirm'

function MyComponent() {
  const { confirm, ConfirmDialog } = useConfirm()

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: '삭제 확인',
      description: '정말로 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'destructive', // 'default' | 'destructive'
    })

    if (confirmed) {
      // 삭제 로직
    }
  }

  return (
    <>
      <button onClick={handleDelete}>삭제</button>
      <ConfirmDialog />
    </>
  )
}
```

### Toast 알림

**사용 방법**:
```typescript
import { toast } from 'sonner'

toast.success('성공 메시지')
toast.error('에러 메시지')
toast.info('정보 메시지')
```

### 아이콘

**lucide-react 사용**:
```typescript
import { User, Building2, Trash2, Edit, Plus } from 'lucide-react'

<User className="w-4 h-4" />
```

## API 구성 가이드

### Axios baseURL 설정

**중요: API 엔드포인트 중복 방지**

프론트엔드에서 axios를 사용할 때 baseURL과 개별 API 호출의 경로가 중복되지 않도록 주의해야 합니다.

**현재 설정** (`parantier-front/src/shared/api/axios.ts`):
```typescript
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const apiClient = axios.create({
  baseURL,  // 이미 /api 포함
  headers: {
    'Content-Type': 'application/json',
  },
})
```

**올바른 API 호출 방법**:
```typescript
// ✅ 올바른 방법 - /api 접두사 제거
apiClient.get('/tasks/folders')  // → http://localhost:8080/api/tasks/folders

// ❌ 잘못된 방법 - /api 중복
apiClient.get('/api/tasks/folders')  // → http://localhost:8080/api/api/tasks/folders
```

**발생했던 문제**:
- 증상: `No static resource api/api/tasks/folders for request '/api/api/tasks/folders'`
- 원인: baseURL에 `/api`가 포함되어 있는데, API 호출 시에도 `/api/tasks/...` 사용
- 결과: `/api/api/tasks/...` 형태로 중복된 경로 생성
- 해결: 모든 API 호출에서 `/api` 접두사 제거

**모범 사례**:
1. baseURL에는 공통 경로(`/api`)를 포함
2. 개별 API 함수에서는 리소스 경로만 명시 (`/tasks/...`, `/users/...`)
3. 절대 경로 형태가 필요한 경우 axios 인스턴스 대신 전체 URL 사용

## 알려진 TypeScript 빌드 에러 패턴

### ag-grid `cellStyle` 타입 오류

**증상:**
```
Type '{ display: string; paddingLeft?: undefined; }' is not assignable to type 'CellStyle'.
Property 'paddingLeft' is incompatible with index signature.
  Type 'undefined' is not assignable to type 'string | number'.
```

**원인:**
`CellStyle`의 인덱스 시그니처 `[key: string]: string | number`가 `undefined`를 허용하지 않는데,
여러 `cellStyle` 객체를 배열에 섞으면 TypeScript가 optional 프로퍼티를 `undefined`로 추론함

**해결:**
```typescript
import type { ColDef, CellStyle } from "ag-grid-community";

// ✅ as CellStyle 캐스팅
cellStyle: { display: "flex", alignItems: "center" } as CellStyle,
cellStyle: { display: "flex", paddingLeft: "8px" } as CellStyle,
```

### `.sql` 파일 gitignore 문제

**증상:** `git add` 시 `.gitignore`에 의해 무시됨
```
The following paths are ignored by one of your .gitignore files: *.sql
```

**원인:** 루트 `.gitignore`에 `*.sql` 패턴이 등록되어 있음

**해결:** 강제 추가
```bash
git add -f parantier-api/src/main/resources/db/migration/Vxx__xxx.sql
```

### Flyway 마이그레이션 관련

**배포 서버 DB 스키마 변경 시:**
1. `parantier-api/src/main/resources/db/migration/` 아래 `Vxx__설명.sql` 파일 생성
2. `git add -f`로 강제 추가 후 커밋 푸시
3. 백엔드 배포 시 Spring Boot 시작 시점에 Flyway가 자동 실행

**배포 서버 메뉴 추가:**
```bash
ssh -i "PEM파일" ubuntu@43.200.241.26 \
  "PGPASSWORD=palantier_password psql -h localhost -p 5432 \
   -U palantier_user -d palantier \
   -c \"INSERT INTO menus (name, path, parent_id, menu_type, order_num, is_active) \
        VALUES ('메뉴명', '/경로', NULL, 'HEADER', 순서, true);\""
```

## WebSocket 구현 원칙

### ❌ STOMP 사용 금지
```
@stomp/stompjs, SimpMessagingTemplate, @EnableWebSocketMessageBroker, @MessageMapping
```
위 라이브러리/어노테이션은 절대 사용하지 않습니다.

### ✅ 순수 WebSocket 사용
- **백엔드**: `@EnableWebSocket` + `TextWebSocketHandler`
- **프론트**: 브라우저 기본 `new WebSocket(url)`

### 메시지 포맷
```json
{ "type": "SUBSCRIBE|CHAT|JOIN|LEAVE|PARTICIPANTS", "topic": "meeting/1", "data": {} }
```

### 공통 훅
```typescript
// 모든 WebSocket 기능은 이 훅을 기반으로 구현
import { usePureWebSocket } from '@/shared/hooks/usePureWebSocket'
```

---

## Git Commit 규칙

- feat: 새로운 기능
- fix: 버그 수정
- refactor: 리팩토링
- docs: 문서 수정

모든 커밋에 다음을 포함:
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```
