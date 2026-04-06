# Tech Wiki 구현 계획

## 개요

팀의 코딩 컨벤션, 아키텍처 결정, 개발 스타일 가이드를 공유하고 관리하는 **Tech Wiki** 메뉴를 추가한다.

- **라우트**: `/wiki`
- **네비게이션 표시명**: `Tech Wiki`
- **참고 레퍼런스**: `PilotPage` (파일럿 관리) — 폴더 트리 + 문서 상세 뷰 구조 그대로 차용
- **차별점**: 카테고리 태그 시스템 + 핀 고정 + 읽기 전용 뷰어 모드 기본 제공

---

## UI/UX 구조

```
┌─────────────────────────────────────────────────────────────┐
│  Tech Wiki                                     [+ 새 문서]   │
├───────────────┬─────────────────────────────────────────────┤
│               │                                             │
│  🔍 검색      │  📌 코딩 컨벤션 > TypeScript 규칙            │
│               │  ────────────────────────────────────────   │
│  📁 코딩 컨벤션│  태그: [컨벤션] [TypeScript] [필독]         │
│   📄 TS 규칙  │                                             │
│   📄 CSS 규칙 │  ## 네이밍 규칙                              │
│               │  - 컴포넌트: PascalCase                      │
│  📁 아키텍처  │  - 함수/변수: camelCase                      │
│   📄 FSD 구조 │  - 상수: SCREAMING_SNAKE_CASE               │
│   📄 API 설계 │                                             │
│               │  ## 파일 구조                               │
│  📁 Git 규칙  │  ...                                        │
│   📄 브랜치   │                                             │
│   📄 커밋     │                  [✏️ 편집]  [🗑️ 삭제]       │
│               │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

- **좌측**: 폴더 트리 (무한 중첩 지원, 컨텍스트 메뉴)
- **우측**: 문서 뷰어 (기본 읽기 모드, 편집 버튼 클릭 시 에디터 전환)
- **사이드바 너비**: 드래그 리사이즈 가능 (PilotPage와 동일)

---

## 기술 스택 및 재사용 전략

### 완전 재사용 (코드 복사 없이 import)

| 재사용 대상 | 출처 | 용도 |
|---|---|---|
| `TaskBlockEditor` | `features/task/components` | 문서 편집기 |
| `TaskBlockViewer` | `features/task/components` | 문서 뷰어 |
| `buildTree()` | `entities/pilot/pilot.types` | 폴더 트리 빌드 |
| `useConfirm` | `shared/hooks/useConfirm` | 삭제 확인 다이얼로그 |
| `BlockType` | `entities/pilot/pilot.types` | NOTE / MMD / FIGMA / DBTABLE |

### 신규 생성 (Wiki 전용)

- `entities/wiki/wiki.types.ts` — Wiki 전용 타입 정의
- `entities/wiki/wikiApi.ts` — API 호출 모듈
- `features/wiki/useWiki.ts` — TanStack Query hooks
- `pages/wiki/WikiPage.tsx` — 메인 페이지 컴포넌트
- 백엔드: `wiki` 패키지 (Pilot 구조 미러링)

---

## 프론트엔드 구현

### 1. 타입 정의 (`entities/wiki/wiki.types.ts`)

```typescript
// Pilot types와 동일 구조, Wiki 도메인으로 분리
export type WikiBlockType = 'NOTE' | 'MMD' | 'FIGMA' | 'FILE' | 'DBTABLE'

export interface WikiFolder {
  id: number
  parentId: number | null
  name: string
  sortOrder: number
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface WikiBlock {
  id?: number
  postId?: number
  blockType: WikiBlockType
  content: string
  sortOrder?: number
}

export interface WikiPost {
  id: number
  folderId: number
  title: string
  authorId: number
  authorName: string
  tags: string[]          // ✨ Wiki 전용: 태그 리스트
  isPinned: boolean       // ✨ Wiki 전용: 핀 고정
  createdAt: string
  updatedAt: string
  blocks?: WikiBlock[]
}

// DTO
export interface WikiFolderDto {
  id?: number
  parentId: number | null
  name: string
  sortOrder?: number
}

export interface WikiPostDto {
  id?: number
  folderId: number
  title: string
  tags?: string[]
  isPinned?: boolean
  blocks: { blockType: WikiBlockType; content: string }[]
}
```

### 2. API 모듈 (`entities/wiki/wikiApi.ts`)

```typescript
const BASE = '/api/wiki'

export const wikiApi = {
  // 폴더
  getFolders: () => fetch(`${BASE}/folders`).then(r => r.json()),
  createFolder: (dto: WikiFolderDto) => fetch(`${BASE}/folders`, { method: 'POST', ... }),
  updateFolder: (id: number, dto: WikiFolderDto) => fetch(`${BASE}/folders/${id}`, { method: 'PUT', ... }),
  deleteFolder: (id: number) => fetch(`${BASE}/folders/${id}`, { method: 'DELETE' }),

  // 포스트
  getPostsByFolder: (folderId: number) => fetch(`${BASE}/posts?folderId=${folderId}`).then(r => r.json()),
  getAllPosts: () => fetch(`${BASE}/posts`).then(r => r.json()),
  getPost: (id: number) => fetch(`${BASE}/posts/${id}`).then(r => r.json()),
  savePost: (dto: WikiPostDto) => fetch(`${BASE}/posts`, { method: 'POST', ... }),
  deletePost: (id: number) => fetch(`${BASE}/posts/${id}`, { method: 'DELETE' }),
}
```

### 3. TanStack Query Hooks (`features/wiki/useWiki.ts`)

Pilot의 `usePilot.ts`와 동일한 패턴으로 작성:

```typescript
// queryKey 네이밍 규칙
['wikiFolders']
['wikiPosts', folderId]
['wikiPost', postId]
```

### 4. 페이지 컴포넌트 (`pages/wiki/WikiPage.tsx`)

PilotPage 구조를 베이스로 아래 차이점만 추가:

```typescript
// ✨ Wiki 전용 추가 기능

// 1. 태그 필터 (상단 탭)
const TAG_FILTERS = ['전체', '컨벤션', '아키텍처', 'Git', 'API', 'DB', '필독']

// 2. 핀 고정 문서 섹션 (트리 최상단에 📌 핀 고정 폴더처럼 표시)
const pinnedPosts = allPosts.filter(p => p.isPinned)

// 3. 읽기 모드 기본값 (isEditing 기본 false, 편집 버튼 클릭 시 true)
const [isEditing, setIsEditing] = useState(false)
```

### 5. 라우터 등록 (`app/routes/index.tsx`)

```typescript
import { WikiPage } from "@/pages/wiki/WikiPage";

const wikiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wiki",
  beforeLoad: () => requireAuth(),
  component: WikiPage,
});

// routeTree에 추가
const routeTree = rootRoute.addChildren([
  ...
  wikiRoute,
  ...
])
```

### 6. 네비게이션 메뉴 등록

Admin 메뉴 관리에서 아래 항목 추가:

| 항목 | 값 |
|---|---|
| 메뉴명 | `Tech Wiki` |
| path | `/wiki` |
| 순서 | 이슈 관리 다음 |
| 아이콘 | `BookOpen` (Lucide) |

---

## 백엔드 구현

### 패키지 구조

Pilot 패키지를 그대로 미러링, `pilot` → `wiki` 로 교체:

```
com.mapo.palantier.wiki
├── block
│   ├── WikiBlock.java
│   ├── WikiBlockMapper.java
│   └── WikiBlockType.java (NOTE, MMD, FIGMA, FILE, DBTABLE)
├── folder
│   ├── WikiFolder.java
│   ├── WikiFolderMapper.java
│   ├── WikiFolderService.java
│   └── presentation/WikiFolderController.java
├── post
│   ├── WikiPost.java
│   ├── WikiPostMapper.java
│   ├── WikiPostService.java
│   └── presentation/WikiPostController.java
└── dto
    ├── WikiFolderDto.java
    ├── WikiPostDto.java
    └── WikiBlockDto.java
```

### 엔티티 차이점 (Pilot 대비)

```java
// WikiPost.java — Pilot 대비 추가 필드
public class WikiPost {
    private Long id;
    private Long folderId;
    private String title;
    private Long authorId;
    private String authorName;
    private boolean isPinned;       // ✨ 핀 고정
    private String tags;            // ✨ 태그 (콤마 구분 문자열로 저장)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private List<WikiBlock> blocks;
}
```

### API 엔드포인트

```
# 폴더
GET    /api/wiki/folders          전체 폴더 목록
POST   /api/wiki/folders          폴더 생성
PUT    /api/wiki/folders/{id}     폴더 수정
DELETE /api/wiki/folders/{id}     폴더 삭제

# 포스트
GET    /api/wiki/posts            전체 or ?folderId={id} 로 필터
GET    /api/wiki/posts/{id}       포스트 상세 (블록 포함)
POST   /api/wiki/posts            포스트 생성/수정
DELETE /api/wiki/posts/{id}       포스트 삭제
```

### DB 테이블 (MyBatis Mapper SQL)

```sql
-- wiki_folder
CREATE TABLE wiki_folder (
    id          BIGSERIAL PRIMARY KEY,
    parent_id   BIGINT REFERENCES wiki_folder(id),
    name        VARCHAR(200) NOT NULL,
    sort_order  INTEGER DEFAULT 0,
    created_by  BIGINT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),
    deleted_at  TIMESTAMP
);

-- wiki_post
CREATE TABLE wiki_post (
    id          BIGSERIAL PRIMARY KEY,
    folder_id   BIGINT NOT NULL REFERENCES wiki_folder(id),
    title       VARCHAR(500) NOT NULL,
    author_id   BIGINT NOT NULL,
    is_pinned   BOOLEAN DEFAULT FALSE,
    tags        VARCHAR(500),           -- '컨벤션,TypeScript,필독'
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),
    deleted_at  TIMESTAMP
);

-- wiki_block
CREATE TABLE wiki_block (
    id          BIGSERIAL PRIMARY KEY,
    post_id     BIGINT NOT NULL REFERENCES wiki_post(id),
    block_type  VARCHAR(20) NOT NULL,   -- NOTE, MMD, FIGMA, FILE, DBTABLE
    content     TEXT,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 구현 순서 (Phase)

### Phase 1 — 백엔드 기반 구축
- [ ] DB 테이블 3개 생성 (wiki_folder, wiki_post, wiki_block)
- [ ] Pilot 패키지 복사 후 `Wiki` prefix로 전체 rename
- [ ] WikiPost에 `isPinned`, `tags` 필드 추가
- [ ] API 엔드포인트 동작 확인 (Swagger)

### Phase 2 — 프론트 기반 구축
- [ ] `entities/wiki/wiki.types.ts` 작성
- [ ] `entities/wiki/wikiApi.ts` 작성 (auth header 포함)
- [ ] `features/wiki/useWiki.ts` 작성 (TanStack Query hooks)
- [ ] 라우터 `/wiki` 등록

### Phase 3 — WikiPage 컴포넌트
- [ ] `pages/wiki/WikiPage.tsx` 생성
- [ ] PilotPage 폴더 트리 구조 이식
- [ ] 읽기 모드 / 편집 모드 토글 UF 구현
- [ ] 태그 표시 UI 추가 (Badge 컴포넌트)
- [ ] 핀 고정 문서 섹션 추가

### Phase 4 — 메뉴 등록 및 마무리
- [ ] Admin 메뉴 관리에서 `Tech Wiki` 항목 추가
- [ ] 다크모드 대응 (시맨틱 색상 토큰 사용 확인)
- [ ] 전체 동작 테스트

---

## 기존 코드와의 차이점 요약

| 항목 | PilotPage (파일럿 관리) | WikiPage (Tech Wiki) |
|---|---|---|
| 용도 | 범용 문서 관리 | 기술 컨벤션/가이드 전용 |
| 기본 모드 | 편집 모드 | **읽기 모드** (편집은 버튼 클릭) |
| 태그 | ❌ | ✅ 배지 형태로 표시 |
| 핀 고정 | ❌ | ✅ 중요 문서 상단 고정 |
| 댓글 | ✅ | ❌ (불필요) |
| BlockType | NOTE, MMD, FIGMA, FILE, DBTABLE | 동일 |
| API prefix | `/api/pilots` | `/api/wiki` |
| QueryKey | `pilotFolders`, `pilotPost` | `wikiFolders`, `wikiPost` |

---

## 다크모드 주의사항

컨텍스트 메뉴, 태그 Badge 등 신규 UI 요소 작성 시 반드시 시맨틱 토큰 사용:

```tsx
// ❌ 하드코딩 금지
className="bg-white border rounded shadow-xl"

// ✅ 시맨틱 토큰 사용
className="bg-card border-border rounded shadow-xl"

// 태그 Badge 예시
className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"

// 핀 고정 표시 예시
className="text-amber-500 dark:text-amber-400"
```
```

완료했어요! 작성된 문서 내용을 정리하면:

---

## 📄 `TECH_WIKI_PLAN.md` 주요 내용

### 전략
**PilotPage를 베이스**로 재사용 — 폴더 트리 + 블록 에디터/뷰어 구조를 그대로 활용하고, Wiki 전용 기능만 추가

### Wiki만의 차별점
| 기능 | 내용 |
|---|---|
| **읽기 모드 기본** | 들어오면 바로 읽기 뷰, 편집은 버튼 클릭 시 |
| **태그 시스템** | `컨벤션`, `아키텍처`, `Git`, `필독` 등 Badge로 표시 |
| **핀 고정** | 중요 문서를 트리 상단에 고정 |
| **댓글 없음** | 위키는 참고 문서라 댓글 불필요 |

### 구현 순서
1. **Phase 1** — 백엔드 DB + API (Pilot 패키지 미러링)
2. **Phase 2** — 프론트 타입/API/hooks
3. **Phase 3** — WikiPage 컴포넌트
4. **Phase 4** — 메뉴 등록 + 다크모드 확인

구현 시작할까요? Phase 1 백엔드부터 바로 진행해드릴 수 있어요!