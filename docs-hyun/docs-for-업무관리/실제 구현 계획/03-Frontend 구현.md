# Frontend 구현 계획

## 참고: 쿠폰 프로젝트 Task 페이지

기본 구조는 `/Users/terecal/coupon_project/src/app/tasks/page.tsx`를 그대로 차용

---

## 디렉토리 구조

```
parantier-front/src/
├── features/
│   └── task/
│       ├── components/
│       │   ├── TaskSidebar.tsx        # 폴더 트리
│       │   ├── TaskFolderTree.tsx     # 재귀 트리 렌더링
│       │   ├── TaskPostList.tsx       # 게시글 목록
│       │   ├── TaskPostDetail.tsx     # 게시글 상세
│       │   ├── TaskBlockEditor.tsx    # 블록 편집
│       │   ├── TaskBlockViewer.tsx    # 블록 조회
│       │   └── TaskComments.tsx       # 댓글
│       ├── api/
│       │   └── taskApi.ts
│       ├── hooks/
│       │   ├── useTaskFolders.ts
│       │   ├── useTaskPosts.ts
│       │   └── useTaskComments.ts
│       └── types/
│           └── task.types.ts
└── routes/
    └── tasks/
        └── index.tsx                  # 메인 페이지
```

---

## 타입 정의

### task.types.ts
```typescript
export type BlockType = 'NOTE' | 'MMD' | 'FIGMA' | 'FILE' | 'DBTABLE'

export interface TaskFolder {
  id: number
  organizationId: number
  parentId: number | null
  name: string
  sortOrder: number
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface TaskBlock {
  id?: number
  postId?: number
  blockType: BlockType
  content: string
  sortOrder?: number
}

export interface TaskPost {
  id: number
  folderId: number
  title: string
  authorId: number
  authorName: string
  createdAt: string
  updatedAt: string
  blocks?: TaskBlock[]
}

export interface TaskComment {
  id: number
  postId: number
  authorId: number
  authorName: string
  content: string
  createdAt: string
}

// JSON 구조
export interface FileContent {
  url: string
  filename: string
  description: string
}

export interface DbColumn {
  no: number
  name: string
  comment: string
  type: string
  size: string
  pk: boolean
  notNull: boolean
  note: string
}

export interface DbTableContent {
  tableName: string
  schema: string
  category: string
  description: string
  columns: DbColumn[]
}

export const TYPE_META: Record<BlockType, { icon: string; label: string; color: string }> = {
  NOTE: { icon: '📝', label: '노트', color: 'bg-blue-100 text-blue-700' },
  MMD: { icon: '📊', label: '다이어그램', color: 'bg-purple-100 text-purple-700' },
  FIGMA: { icon: '🎨', label: 'Figma', color: 'bg-pink-100 text-pink-700' },
  FILE: { icon: '📎', label: '첨부파일', color: 'bg-green-100 text-green-700' },
  DBTABLE: { icon: '🗄️', label: 'DB테이블', color: 'bg-amber-100 text-amber-700' },
}
```

---

## React Query Hooks

### useTaskFolders.ts
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '../api/taskApi'

export function useTaskFolders() {
  return useQuery({
    queryKey: ['taskFolders'],
    queryFn: () => taskApi.getFolders(),
  })
}

export function useCreateFolderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; parentId: number | null }) =>
      taskApi.createFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskFolders'] })
    },
  })
}

export function useRenameFolderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      taskApi.updateFolder(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskFolders'] })
    },
  })
}

export function useDeleteFolderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => taskApi.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskFolders'] })
    },
  })
}
```

### useTaskPosts.ts
```typescript
export function useTaskPosts(folderId: number | null) {
  return useQuery({
    queryKey: ['taskPosts', folderId],
    queryFn: () => taskApi.getPostsByFolder(folderId!),
    enabled: !!folderId,
  })
}

export function useTaskPostDetail(postId: number | null) {
  return useQuery({
    queryKey: ['taskPost', postId],
    queryFn: () => taskApi.getPost(postId!),
    enabled: !!postId,
  })
}

export function useSaveTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TaskPostDto) => taskApi.savePost(data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['taskPosts', variables.folderId] })
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['taskPost', variables.id] })
      }
    },
  })
}
```

---

## 메인 페이지 구조

### routes/tasks/index.tsx
```typescript
export default function TasksPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set())
  const [isEditing, setIsEditing] = useState(false)

  const [sidebarWidth, setSidebarWidth] = useState(250)
  const isResizing = useRef(false)

  const { data: folders = [] } = useTaskFolders()
  const { data: posts = [] } = useTaskPosts(selectedFolderId)
  const { data: postDetail } = useTaskPostDetail(selectedPostId)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-stretch">
        {/* 좌: 폴더 트리 */}
        <div className="shrink-0 bg-white rounded border" style={{ width: sidebarWidth }}>
          <TaskSidebar
            folders={folders}
            selectedFolderId={selectedFolderId}
            expandedFolders={expandedFolders}
            onSelectFolder={setSelectedFolderId}
            onToggleExpand={(id) => { /* ... */ }}
          />
        </div>

        {/* 크기 조절 핸들 */}
        <div className="w-4 cursor-col-resize" onMouseDown={handleResizeStart} />

        {/* 우: 게시글 목록 + 상세 */}
        <div className="flex-1 flex flex-col gap-4">
          {/* 게시글 목록 */}
          <TaskPostList
            posts={posts}
            selectedPostId={selectedPostId}
            onSelectPost={setSelectedPostId}
          />

          {/* 게시글 상세 */}
          <div className="bg-white rounded border">
            {isEditing ? (
              <TaskBlockEditor
                postDetail={postDetail}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <TaskBlockViewer
                postDetail={postDetail}
                onEdit={() => setIsEditing(true)}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 컴포넌트 상세

### TaskSidebar.tsx
- 폴더 트리 렌더링
- 우클릭 컨텍스트 메뉴
- 인라인 폴더명 편집
- 드래그 앤 드롭 (옵션)

### TaskBlockEditor.tsx
- 블록 추가/삭제/순서 변경
- NOTE: textarea
- MMD: textarea + 미리보기 토글
- FIGMA: URL 입력
- FILE: 파일 선택 + 메타데이터
- DBTABLE: TSV 파싱 + 테이블 편집

### TaskBlockViewer.tsx
- NOTE: 마크다운 렌더링 (또는 pre-wrap)
- MMD: MermaidChart 컴포넌트
- FIGMA: iframe 임베드
- FILE: 다운로드 링크
- DBTABLE: 테이블 렌더링

---

## 블록 타입별 렌더링

### NOTE 블록
```tsx
{block.blockType === 'NOTE' && (
  <div className="p-4 bg-white">
    <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
      {block.content}
    </pre>
  </div>
)}
```

### MMD 블록
```tsx
{block.blockType === 'MMD' && (
  <div className="p-4 bg-white">
    <MermaidChart chart={block.content} />
  </div>
)}
```

### DBTABLE 블록
```tsx
{block.blockType === 'DBTABLE' && (() => {
  const tbl = JSON.parse(block.content) as DbTableContent
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <span className="font-mono font-bold">{tbl.tableName}</span>
        {tbl.schema && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{tbl.schema}</span>}
      </div>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th>No</th>
            <th>컬럼명</th>
            <th>설명</th>
            <th>타입</th>
            <th>크기</th>
            <th>PK</th>
            <th>NN</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          {tbl.columns.map((col) => (
            <tr key={col.no}>
              <td>{col.no}</td>
              <td className="font-mono">{col.name}</td>
              <td>{col.comment}</td>
              <td>{col.type}</td>
              <td>{col.size}</td>
              <td>{col.pk ? '✓' : ''}</td>
              <td>{col.notNull ? '✓' : ''}</td>
              <td>{col.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})()}
```

---

## 다음 단계
1. 타입 정의 작성
2. API 클라이언트 작성
3. React Query Hooks 작성
4. 메인 페이지 레이아웃
5. 폴더 트리 컴포넌트
6. 블록 에디터/뷰어 컴포넌트
