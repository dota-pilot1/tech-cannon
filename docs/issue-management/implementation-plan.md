# 이슈 관리 기능 구현 계획

## 1. 개요

### 목적
- 프로젝트 내 이슈/버그/기능 요청을 체계적으로 관리
- 담당자 지정, 상태 추적, 댓글 기능 제공
- 체크리스트와 첨부파일로 상세 관리 지원

### 참고 프로젝트
- `/Users/terecal/coupon_project` 쿠폰 프로젝트 참조
- Next.js + Drizzle ORM + SQLite 구조를 Spring Boot + MyBatis + PostgreSQL로 전환

---

## 2. 데이터베이스 설계

### 2.1 issues (이슈 테이블)

```sql
CREATE TABLE issues (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'COMMON' NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN' NOT NULL,
    priority VARCHAR(50) DEFAULT 'MEDIUM' NOT NULL,

    -- 사용자 관계
    author_id BIGINT NOT NULL,
    assignee_id BIGINT,

    -- 조직/폴더 연결
    organization_id BIGINT,
    folder_id BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (folder_id) REFERENCES task_folders(id) ON DELETE SET NULL
);

CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_assignee ON issues(assignee_id);
CREATE INDEX idx_issues_created ON issues(created_at DESC);
CREATE INDEX idx_issues_folder ON issues(folder_id);
```

**필드 설명:**
- `category`: COMMON, BUG, FEATURE, IMPROVEMENT, QUESTION 등
- `status`: OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
- `priority`: LOW, MEDIUM, HIGH, CRITICAL
- `author_id`: 이슈 작성자
- `assignee_id`: 담당자 (NULL 가능)
- `folder_id`: 폴더 연결 (선택)

### 2.2 issue_comments (이슈 댓글 테이블)

```sql
CREATE TABLE issue_comments (
    id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX idx_issue_comments_issue ON issue_comments(issue_id);
CREATE INDEX idx_issue_comments_created ON issue_comments(created_at DESC);
```

### 2.3 issue_checklists (이슈 체크리스트 테이블)

```sql
CREATE TABLE issue_checklists (
    id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    checked BOOLEAN DEFAULT FALSE NOT NULL,
    order_num INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

CREATE INDEX idx_issue_checklists_issue ON issue_checklists(issue_id);
```

### 2.4 issue_attachments (이슈 첨부파일 테이블)

```sql
CREATE TABLE issue_attachments (
    id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    content_type VARCHAR(100),
    uploaded_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX idx_issue_attachments_issue ON issue_attachments(issue_id);
```

---

## 3. Backend 구조

### 3.1 패키지 구조

```
com.mapo.palantier.issue/
   domain/
      Issue.java
      IssueComment.java
      IssueChecklist.java
      IssueAttachment.java
      IssueStatus.java (enum)
      IssuePriority.java (enum)
      IssueCategory.java (enum)
      IssueRepository.java
   application/
      IssueService.java
      IssueCommentService.java
      IssueChecklistService.java
      IssueAttachmentService.java
   presentation/
      IssueController.java
      dto/
         CreateIssueRequest.java
         UpdateIssueRequest.java
         IssueResponse.java
         IssueDetailResponse.java
         CreateCommentRequest.java
         CreateChecklistRequest.java
         UploadAttachmentRequest.java
   infrastructure/
       IssueMapper.java (MyBatis)
       IssueCommentMapper.java
       IssueChecklistMapper.java
       IssueAttachmentMapper.java
```

### 3.2 주요 API 엔드포인트

#### 이슈 CRUD
```
GET    /api/issues                    # 이슈 목록 (필터링, 페이징)
POST   /api/issues                    # 이슈 생성
GET    /api/issues/{id}               # 이슈 상세 조회
PUT    /api/issues/{id}               # 이슈 수정
DELETE /api/issues/{id}               # 이슈 삭제
PUT    /api/issues/{id}/status        # 상태 변경
PUT    /api/issues/{id}/assignee      # 담당자 변경
```

#### 댓글
```
GET    /api/issues/{id}/comments      # 댓글 목록
POST   /api/issues/{id}/comments      # 댓글 작성
PUT    /api/issues/{id}/comments/{commentId}    # 댓글 수정
DELETE /api/issues/{id}/comments/{commentId}    # 댓글 삭제
```

#### 체크리스트
```
GET    /api/issues/{id}/checklists    # 체크리스트 목록
POST   /api/issues/{id}/checklists    # 체크리스트 항목 추가
PUT    /api/issues/{id}/checklists/{checkId}/toggle  # 체크 상태 변경
DELETE /api/issues/{id}/checklists/{checkId}         # 체크리스트 삭제
```

#### 첨부파일
```
GET    /api/issues/{id}/attachments   # 첨부파일 목록
POST   /api/issues/{id}/attachments   # 첨부파일 업로드
DELETE /api/issues/{id}/attachments/{attachmentId}  # 첨부파일 삭제
```

### 3.3 MyBatis Mapper 예시

```xml
<!-- IssueMapper.xml -->
<mapper namespace="com.mapo.palantier.issue.infrastructure.IssueMapper">

    <resultMap id="IssueResultMap" type="com.mapo.palantier.issue.domain.Issue">
        <id property="id" column="id"/>
        <result property="title" column="title"/>
        <result property="content" column="content"/>
        <result property="category" column="category"/>
        <result property="status" column="status"/>
        <result property="priority" column="priority"/>
        <result property="authorId" column="author_id"/>
        <result property="assigneeId" column="assignee_id"/>
        <result property="organizationId" column="organization_id"/>
        <result property="folderId" column="folder_id"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <select id="findAll" resultMap="IssueResultMap">
        SELECT * FROM issues
        <where>
            <if test="status != null">
                AND status = #{status}
            </if>
            <if test="assigneeId != null">
                AND assignee_id = #{assigneeId}
            </if>
            <if test="category != null">
                AND category = #{category}
            </if>
            <if test="folderId != null">
                AND folder_id = #{folderId}
            </if>
        </where>
        ORDER BY created_at DESC
        LIMIT #{limit} OFFSET #{offset}
    </select>

    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO issues (
            title, content, category, status, priority,
            author_id, assignee_id, organization_id, folder_id
        ) VALUES (
            #{title}, #{content}, #{category}, #{status}, #{priority},
            #{authorId}, #{assigneeId}, #{organizationId}, #{folderId}
        )
    </insert>

    <update id="updateStatus">
        UPDATE issues
        SET status = #{status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

</mapper>
```

---

## 4. Frontend 구조

### 4.1 페이지 구조

```
parantier-front/src/
   pages/
      issues/
          IssuesPage.tsx          # 이슈 목록
          IssueDetailPage.tsx     # 이슈 상세
   features/
      issue/
          components/
             IssueList.tsx
             IssueCard.tsx
             IssueForm.tsx
             IssueDetail.tsx
             CommentList.tsx
             CommentForm.tsx
             ChecklistItem.tsx
             AttachmentList.tsx
             IssueFilters.tsx
          hooks/
             useIssues.ts
             useIssueDetail.ts
             useCreateIssue.ts
             useUpdateIssue.ts
          types/
              issue.ts
   routes/
      issues/
          index.tsx               # /issues
          $issueId.tsx            # /issues/{issueId}
   api/
       issueApi.ts
```

### 4.2 라우트 등록

```typescript
// src/app/routes/index.tsx

import { IssuesPage } from '@/pages/issues/IssuesPage'
import { IssueDetailPage } from '@/pages/issues/IssueDetailPage'

// 이슈 목록
const issuesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/issues',
  beforeLoad: () => requireAuth(),
  component: IssuesPage,
})

// 이슈 상세
const issueDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/issues/$issueId',
  beforeLoad: () => requireAuth(),
  component: IssueDetailPage,
})

// routeTree에 추가
const routeTree = rootRoute.addChildren([
  // ... 기존 라우트
  issuesRoute,
  issueDetailRoute,
])
```

### 4.3 API 클라이언트

```typescript
// src/api/issueApi.ts

import { apiClient } from '@/shared/api/client'
import type { Issue, IssueComment, IssueChecklist } from '@/types/issue'

export const issueApi = {
  // 이슈 목록 조회
  getIssues: async (params?: {
    status?: string
    category?: string
    assigneeId?: number
    page?: number
    limit?: number
  }) => {
    const { data } = await apiClient.get('/issues', { params })
    return data
  },

  // 이슈 상세 조회
  getIssue: async (id: number): Promise<Issue> => {
    const { data } = await apiClient.get(`/issues/${id}`)
    return data
  },

  // 이슈 생성
  createIssue: async (issue: Partial<Issue>): Promise<Issue> => {
    const { data } = await apiClient.post('/issues', issue)
    return data
  },

  // 이슈 수정
  updateIssue: async (id: number, issue: Partial<Issue>): Promise<Issue> => {
    const { data } = await apiClient.put(`/issues/${id}`, issue)
    return data
  },

  // 이슈 삭제
  deleteIssue: async (id: number): Promise<void> => {
    await apiClient.delete(`/issues/${id}`)
  },

  // 상태 변경
  updateStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.put(`/issues/${id}/status`, { status })
  },

  // 댓글 관련
  getComments: async (issueId: number): Promise<IssueComment[]> => {
    const { data } = await apiClient.get(`/issues/${issueId}/comments`)
    return data
  },

  createComment: async (issueId: number, content: string): Promise<IssueComment> => {
    const { data } = await apiClient.post(`/issues/${issueId}/comments`, { content })
    return data
  },

  // 체크리스트 관련
  getChecklists: async (issueId: number): Promise<IssueChecklist[]> => {
    const { data } = await apiClient.get(`/issues/${issueId}/checklists`)
    return data
  },

  createChecklist: async (issueId: number, content: string): Promise<IssueChecklist> => {
    const { data } = await apiClient.post(`/issues/${issueId}/checklists`, { content })
    return data
  },

  toggleChecklist: async (issueId: number, checkId: number): Promise<void> => {
    await apiClient.put(`/issues/${issueId}/checklists/${checkId}/toggle`)
  },
}
```

### 4.4 React Query 훅

```typescript
// src/features/issue/hooks/useIssues.ts

import { useQuery } from '@tanstack/react-query'
import { issueApi } from '@/api/issueApi'

export function useIssues(filters?: {
  status?: string
  category?: string
  assigneeId?: number
}) {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: () => issueApi.getIssues(filters),
  })
}

export function useIssueDetail(issueId: number) {
  return useQuery({
    queryKey: ['issues', issueId],
    queryFn: () => issueApi.getIssue(issueId),
    enabled: !!issueId,
  })
}

export function useCreateIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: issueApi.createIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      toast.success('이슈가 생성되었습니다.')
    },
  })
}
```

---

## 5. UI 화면 예시

### 5.1 이슈 목록 페이지

```typescript
// src/pages/issues/IssuesPage.tsx

export function IssuesPage() {
  const [filters, setFilters] = useState({
    status: 'OPEN',
    category: null,
  })

  const { data: issues, isLoading } = useIssues(filters)
  const { confirm, ConfirmDialog } = useConfirm()

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">이슈 관리</h1>
        <Button onClick={() => navigate({ to: '/issues/new' })}>
          <Plus className="w-4 h-4 mr-2" />
          새 이슈
        </Button>
      </div>

      <IssueFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div>로딩중...</div>
      ) : (
        <IssueList issues={issues} />
      )}

      <ConfirmDialog />
    </div>
  )
}
```

### 5.2 이슈 상세 화면 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 이슈 #123: 로그인 페이지 오류 수정 필요        [편집] [삭제] │
├─────────────────────────────────────────────────────────────┤
│ 상태: OPEN    우선순위: HIGH    카테고리: BUG           │
│ 작성자: 홍길동    담당자: [담당자 지정 +]                │
│ 작성일: 2024-03-26    수정일: 2024-03-26                │
├─────────────────────────────────────────────────────────────┤
│ 상세 설명                                                │
│ - 로그인 시 이메일 입력 필드 유효성 검사 누락                   │
│ - 오류 메시지 표시가 올바르지 않음                              │
├─────────────────────────────────────────────────────────────┤
│ 체크리스트                                               │
│ ☑ 문제 원인 파악                                         │
│ ☐ 수정 코드 작성                                       │
│ ☐ 테스트 완료                                              │
├─────────────────────────────────────────────────────────────┤
│ 첨부파일                                                 │
│ 📎 screenshot.png (120 KB)                               │
│ 📎 error-log.txt (5 KB)                                  │
├─────────────────────────────────────────────────────────────┤
│ 댓글 (3)                                                 │
│                                                         │
│ @김철수 • 2024-03-26 10:30                               │
│ 원인 파악했습니다. API 호출 시 예외처리가 누락됨.          │
│                                                         │
│ 홍길동 • 2024-03-26 11:00                               │
│ 감사합니다. 오늘 중 수정 완료하겠습니다.                           │
│                                                         │
│ [댓글 작성...]                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. 구현 단계

### Phase 1: 기본 CRUD (1-2일)
1. DB 테이블 생성 (issues, issue_comments)
2. Backend 기본 구조 (domain, repository, service, controller)
3. MyBatis Mapper 작성
4. Frontend 기본 페이지 (목록, 상세)
5. 라우트 등록

### Phase 2: 댓글 및 상태 관리 (1일)
1. 댓글 CRUD 구현
2. 상태 변경 기능
3. 담당자 지정 기능
4. 필터링 (상태, 카테고리, 담당자)

### Phase 3: 체크리스트 (0.5일)
1. 체크리스트 CRUD
2. 체크 상태 토글
3. UI 구현

### Phase 4: 첨부파일 (1일)
1. 파일 업로드 API
2. S3 연동 (선택)
3. 첨부파일 목록 표시
4. 업로드/삭제 기능

### Phase 5: UI/UX 개선 (1일)
1. 이슈 카드 레이아웃 개선
2. 필터링 UI
3. 정렬, 검색
4. 반응형 디자인
5. 로딩 상태

---

## 7. 참고사항

### 7.1 쿠폰 프로젝트와 차이점

| 항목 | 쿠폰 프로젝트 | Palantier 프로젝트 |
|------|--------------|-------------------|
| 프레임워크 | Next.js | Spring Boot + React |
| ORM | Drizzle | MyBatis |
| DB | SQLite | PostgreSQL |
| 라우팅 | Next.js 파일 기반 | TanStack Router 수동 등록 |
| 담당자 | 단일 담당자 | assignee_id 컬럼 사용 |
| 조직 연결 | 없음 | organization_id, folder_id |

### 7.2 권한 관리 정책

1. **이슈 생성**
   - 이슈 생성: 모든 사용자
   - 이슈 수정: 작성자 + 담당자 + ADMIN
   - 이슈 삭제: 작성자 + ADMIN
   - 댓글 작성/수정: 작성자 본인만

2. **알림 기능** (선택)
   - 담당자 지정 시 알림
   - 댓글 작성 시 작성자/담당자에게 알림
   - 상태 변경 시 알림

3. **대시보드 통계** (선택)
   - 담당자별 이슈 현황
   - 상태별 통계 차트
   - 우선순위 별 통계
   - 기한 지연 이슈 표시

4. **고급 필터링**
   - 날짜/기간 필터
   - 복합 필터 (상태 + 우선순위 + 담당자)
   - 검색 기능 (제목, 내용)

---

## 8. 예상 소요 시간

- **Backend 개발**: 2-3일
- **Frontend 개발**: 2-3일
- **테스트 및 버그 수정**: 1일
- **문서화**: 0.5일

**총 예상 기간**: 5-7일

---

## 9. 다음 단계

1. ✅ 구현 계획 문서 작성 (완료)
2. ⬜ DB 테이블 생성 SQL 실행
3. ⬜ Backend 패키지 구조 생성
4. ⬜ Domain 객체 작성
5. ⬜ MyBatis Mapper 작성
6. ⬜ Service 로직 구현
7. ⬜ Controller 작성
8. ⬜ Frontend 페이지 구현
9. ⬜ 테스트 및 검증
10. ⬜ 배포

---

**작성일**: 2024-03-26
**작성자**: Claude (AI Assistant)
**참고 프로젝트**: /Users/terecal/coupon_project
