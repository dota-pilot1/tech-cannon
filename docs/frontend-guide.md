# 프론트엔드 개발 가이드

## UI 컴포넌트

### shadcn/ui

위치: `parantier-front/src/shared/ui/`

주요 컴포넌트: `button`, `dialog`, `alert-dialog`, `input`, `checkbox`, `select`, `context-menu`, `dropdown-menu`

```typescript
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/shared/ui/dialog'
```

새 컴포넌트 추가:
```bash
cd parantier-front && npx shadcn@latest add [component-name]
```

### 공통 훅

```typescript
// 확인 다이얼로그
import { useConfirm } from '@/shared/hooks/useConfirm'

const { confirm, ConfirmDialog } = useConfirm()
const confirmed = await confirm({
  title: '삭제 확인',
  description: '정말 삭제하시겠습니까?',
  confirmText: '삭제',
  cancelText: '취소',
  variant: 'destructive',
})
```

### Toast

```typescript
import { toast } from 'sonner'
toast.success('성공') / toast.error('에러') / toast.info('정보')
```

### 아이콘

```typescript
import { User, Building2, Trash2 } from 'lucide-react'
```

---

## API 구성

baseURL: `http://localhost:8080/api` (이미 `/api` 포함)

```typescript
// ✅ 올바른 방법
apiClient.get('/tasks/folders')

// ❌ 잘못된 방법 (중복 경로 발생)
apiClient.get('/api/tasks/folders')
```

---

## 알려진 TypeScript 에러 패턴

### ag-grid cellStyle 타입 오류

```typescript
// ✅ 해결
import type { CellStyle } from "ag-grid-community"
cellStyle: { display: "flex", alignItems: "center" } as CellStyle,
```

### .sql 파일 gitignore 문제

```bash
# ✅ 강제 추가
git add -f parantier-api/src/main/resources/db/migration/Vxx__xxx.sql
```
