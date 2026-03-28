# 백엔드 API 설계

## 📡 RESTful API 엔드포인트

### 1. 카테고리 관리

#### GET `/api/note-categories`
카테고리 트리 전체 조회 (재귀 쿼리로 계층 구조 반환)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Core",
      "parentId": null,
      "icon": "🧱",
      "depth": 0,
      "children": [
        {
          "id": 6,
          "name": "Frontend",
          "parentId": 1,
          "icon": null,
          "depth": 1,
          "children": []
        },
        {
          "id": 7,
          "name": "Backend",
          "parentId": 1,
          "icon": null,
          "depth": 1,
          "children": []
        }
      ]
    }
  ]
}
```

#### POST `/api/note-categories`
카테고리 생성 (관리자만)

**Request:**
```json
{
  "name": "New Category",
  "parentId": 1,
  "icon": "📚",
  "description": "Category description",
  "orderNum": 10
}
```

#### PUT `/api/note-categories/{id}`
카테고리 수정 (관리자만)

#### DELETE `/api/note-categories/{id}`
카테고리 삭제 (관리자만, CASCADE로 하위 노트도 삭제)

---

### 2. 노트 관리

#### GET `/api/notes`
노트 목록 조회 (필터링 지원)

**Query Parameters:**
- `categoryId`: 카테고리 ID (필수)
- `keyword`: 검색 키워드 (선택)
- `authorId`: 작성자 ID (선택)
- `isPublic`: 공개 여부 (선택)
- `page`: 페이지 번호 (기본: 0)
- `size`: 페이지 크기 (기본: 20)

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "categoryId": 6,
      "categoryName": "Frontend",
      "title": "React 19 새로운 기능 정리",
      "authorId": 1,
      "authorName": "오현석",
      "isPublic": true,
      "viewCount": 42,
      "isPinned": false,
      "tags": ["React", "Frontend", "RSC"],
      "createdAt": "2026-03-27T15:30:00",
      "updatedAt": "2026-03-28T10:20:00"
    }
  ],
  "totalElements": 15,
  "totalPages": 1,
  "number": 0,
  "size": 20
}
```

#### GET `/api/notes/{id}`
노트 상세 조회 (조회수 +1)

**Response:**
```json
{
  "id": 1,
  "categoryId": 6,
  "categoryName": "Frontend",
  "title": "React 19 새로운 기능 정리",
  "content": "# React 19 주요 업데이트\n\n## 1. Server Components...",
  "authorId": 1,
  "authorName": "오현석",
  "isPublic": true,
  "viewCount": 43,
  "isPinned": false,
  "tags": ["React", "Frontend", "RSC"],
  "attachments": [
    {
      "id": 1,
      "fileName": "react-19-diagram.png",
      "fileUrl": "https://s3.amazonaws.com/...",
      "fileType": "image",
      "fileSize": 102400
    }
  ],
  "createdAt": "2026-03-27T15:30:00",
  "updatedAt": "2026-03-28T10:20:00"
}
```

#### POST `/api/notes`
노트 생성

**Request:**
```json
{
  "categoryId": 6,
  "title": "TanStack Query 패턴 정리",
  "content": "# TanStack Query\n\n## useQuery 기본 패턴...",
  "isPublic": true,
  "tags": ["React", "TanStack Query", "Data Fetching"]
}
```

**Response:**
```json
{
  "id": 15,
  "categoryId": 6,
  "title": "TanStack Query 패턴 정리",
  "authorId": 1,
  "createdAt": "2026-03-28T14:30:00"
}
```

#### PUT `/api/notes/{id}`
노트 수정 (작성자 또는 관리자만)

**Request:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "isPublic": false,
  "tags": ["React", "Updated"]
}
```

#### DELETE `/api/notes/{id}`
노트 삭제 (작성자 또는 관리자만)

#### POST `/api/notes/{id}/pin`
노트 상단 고정 (토글)

---

### 3. 첨부파일 관리

#### POST `/api/notes/{noteId}/attachments`
첨부파일 업로드 (S3)

**Request:** `multipart/form-data`
- `file`: 파일 (최대 10MB)
- `fileType`: 파일 타입 (image, document, code)

**Response:**
```json
{
  "id": 5,
  "noteId": 1,
  "fileName": "example.png",
  "fileUrl": "https://s3.amazonaws.com/hibot-docu/notes/1/example.png",
  "fileType": "image",
  "fileSize": 204800,
  "createdAt": "2026-03-28T15:00:00"
}
```

#### DELETE `/api/notes/{noteId}/attachments/{id}`
첨부파일 삭제 (S3에서도 삭제)

---

### 4. 검색

#### GET `/api/notes/search`
전체 노트 검색

**Query Parameters:**
- `keyword`: 검색 키워드 (필수)
- `categoryId`: 카테고리 필터 (선택)
- `page`: 페이지 번호
- `size`: 페이지 크기

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "categoryId": 6,
      "categoryName": "Frontend",
      "title": "React 19 새로운 기능 정리",
      "contentPreview": "...React 19 주요 업데이트 중 Server Components...",
      "authorName": "오현석",
      "createdAt": "2026-03-27T15:30:00"
    }
  ],
  "totalElements": 3
}
```

---

## 🔐 권한 체계

### 인증/인가
- 모든 API는 JWT 인증 필요
- 공개 노트 (`isPublic: true`): 모든 로그인 사용자 조회 가능
- 비공개 노트 (`isPublic: false`): 작성자만 조회 가능
- 수정/삭제: 작성자 또는 `ROLE_ADMIN`만 가능
- 카테고리 관리: `ROLE_ADMIN`만 가능

### 권한 검증 로직
```java
// 노트 조회 권한
public boolean canViewNote(Note note, User currentUser) {
    return note.isPublic() ||
           note.getAuthorId().equals(currentUser.getId()) ||
           currentUser.hasRole("ROLE_ADMIN");
}

// 노트 수정/삭제 권한
public boolean canEditNote(Note note, User currentUser) {
    return note.getAuthorId().equals(currentUser.getId()) ||
           currentUser.hasRole("ROLE_ADMIN");
}
```

---

## 📦 패키지 구조

```
com.mapo.palantier
├── note
│   ├── domain
│   │   ├── NoteCategory.java
│   │   ├── Note.java
│   │   ├── NoteAttachment.java
│   │   └── NoteVersion.java (선택)
│   ├── repository
│   │   ├── NoteCategoryMapper.java
│   │   ├── NoteMapper.java
│   │   └── NoteAttachmentMapper.java
│   ├── service
│   │   ├── NoteCategoryService.java
│   │   ├── NoteService.java
│   │   └── NoteAttachmentService.java
│   ├── controller
│   │   ├── NoteCategoryController.java
│   │   ├── NoteController.java
│   │   └── NoteAttachmentController.java
│   └── dto
│       ├── NoteCategoryRequest.java
│       ├── NoteRequest.java
│       ├── NoteResponse.java
│       └── NoteSearchRequest.java
```

---

## 🗄️ MyBatis Mapper 예시

### NoteCategoryMapper.xml
```xml
<!-- 재귀 CTE로 카테고리 트리 조회 -->
<select id="findCategoryTree" resultType="NoteCategoryDto">
    WITH RECURSIVE category_tree AS (
        SELECT
            id,
            name,
            parent_id,
            icon,
            description,
            order_num,
            0 AS depth,
            ARRAY[order_num] AS path
        FROM note_categories
        WHERE parent_id IS NULL AND is_active = true

        UNION ALL

        SELECT
            c.id,
            c.name,
            c.parent_id,
            c.icon,
            c.description,
            c.order_num,
            ct.depth + 1,
            ct.path || c.order_num
        FROM note_categories c
        INNER JOIN category_tree ct ON c.parent_id = ct.id
        WHERE c.is_active = true
    )
    SELECT * FROM category_tree
    ORDER BY path
</select>
```

### NoteMapper.xml
```xml
<!-- 카테고리별 노트 목록 -->
<select id="findNotesByCategory" resultType="NoteDto">
    SELECT
        n.id,
        n.category_id,
        nc.name AS category_name,
        n.title,
        n.author_id,
        u.username AS author_name,
        n.is_public,
        n.view_count,
        n.is_pinned,
        n.tags,
        n.created_at,
        n.updated_at
    FROM notes n
    INNER JOIN note_categories nc ON n.category_id = nc.id
    INNER JOIN users u ON n.author_id = u.id
    WHERE n.category_id = #{categoryId}
      AND (n.is_public = true OR n.author_id = #{currentUserId})
    <if test="keyword != null">
      AND (n.title ILIKE CONCAT('%', #{keyword}, '%') OR n.content ILIKE CONCAT('%', #{keyword}, '%'))
    </if>
    ORDER BY n.is_pinned DESC, n.order_num ASC, n.created_at DESC
    LIMIT #{size} OFFSET #{offset}
</select>
```

---

## 🧪 테스트 전략

### 단위 테스트
- Service Layer 로직 검증
- 권한 검증 로직 테스트
- Mapper 쿼리 테스트 (MyBatis Test)

### 통합 테스트
- API 엔드포인트 E2E 테스트
- 인증/인가 시나리오 테스트
- S3 파일 업로드 mock 테스트

---

**작성일**: 2026-03-28
