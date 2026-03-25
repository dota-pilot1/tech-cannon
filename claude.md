# Palantier 프로젝트 개발 가이드

## 데이터베이스 관리 원칙

### ⚠️ 중요: DB 변경 작업 원칙

**테이블 생성/업데이트는 Docker DB에 직접 실행이 원칙입니다**

- Flyway 마이그레이션 파일을 사용하지 않습니다
- 모든 스키마 변경, 데이터 추가는 Docker 컨테이너에 직접 SQL을 실행합니다
- Flyway 마이그레이션 파일은 히스토리 참고용으로만 유지됩니다
- 실제 운영에서는 Docker DB에 직접 SQL을 실행해야 합니다

### 데이터베이스 접속 정보

**Docker 컨테이너 정보:**
```bash
Container Name: palantier-postgres
Image: postgres:16
```

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

### Frontend (parantier-front)
- React + TypeScript
- TanStack Router
- TanStack Query
- Vite

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

**중요: 서버 시작/중지는 사용자가 직접 수행합니다.**
- Claude는 서버를 자동으로 시작하거나 중지하지 않습니다
- 개발 중 서버 재시작이 필요한 경우 사용자에게 안내만 합니다
- **테스트 전 서버 종료**: 사용자가 직접 UI 테스트를 시작하기 전에는 반드시 서버를 종료해야 합니다

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
