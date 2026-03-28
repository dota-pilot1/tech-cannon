# 백엔드 API 설계

## 📡 RESTful API 엔드포인트

### 1. 카테고리 관리

#### GET `/api/study/categories`
카테고리 트리 전체 조회 (재귀 CTE로 계층 구조 반환)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "React",
      "parentId": null,
      "icon": "⚛️",
      "depth": 0,
      "children": [
        {
          "id": 6,
          "name": "React Hooks",
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

#### POST `/api/study/categories`
카테고리 생성 (ROLE_ADMIN만)

**Request:**
```json
{
  "name": "New Category",
  "parentId": 1,
  "icon": "📚",
  "description": "카테고리 설명",
  "orderNum": 10
}
```

#### PUT `/api/study/categories/{id}`
카테고리 수정 (ROLE_ADMIN만)

#### DELETE `/api/study/categories/{id}`
카테고리 삭제 (ROLE_ADMIN만, CASCADE로 하위 게시글도 삭제)

---

### 2. 게시글 관리

#### GET `/api/study/posts`
게시글 목록 조회

**Query Parameters:**
- `categoryId`: 카테고리 ID (필수)
- `keyword`: 검색 키워드 (선택)
- `page`: 페이지 번호 (기본: 0)
- `size`: 페이지 크기 (기본: 20)

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "categoryId": 1,
      "categoryName": "React",
      "title": "React 19 새로운 기능 정리",
      "authorId": 1,
      "authorName": "오현석",
      "isPublic": true,
      "viewCount": 42,
      "likeCount": 12,
      "commentCount": 3,
      "isPinned": false,
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

#### GET `/api/study/posts/{id}`
게시글 상세 조회 (조회수 +1)

**Response:**
```json
{
  "id": 1,
  "categoryId": 1,
  "categoryName": "React",
  "title": "React 19 새로운 기능 정리",
  "content": "{\"root\":{...}}",
  "authorId": 1,
  "authorName": "오현석",
  "isPublic": true,
  "viewCount": 43,
  "likeCount": 12,
  "commentCount": 3,
  "isPinned": false,
  "isLikedByMe": false,
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

#### POST `/api/study/posts`
게시글 생성

**Request:**
```json
{
  "categoryId": 1,
  "title": "TanStack Query 패턴 정리",
  "content": "{\"root\":{...}}",
  "isPublic": true
}
```

#### PUT `/api/study/posts/{id}`
게시글 수정 (작성자 또는 ROLE_ADMIN만)

```json
{
  "title": "수정된 제목",
  "content": "{\"root\":{...}}",
  "isPublic": true
}
```

#### DELETE `/api/study/posts/{id}`
게시글 삭제 (작성자 또는 ROLE_ADMIN만)

#### POST `/api/study/posts/{id}/pin`
게시글 상단 고정 토글 (ROLE_ADMIN만)

---

### 3. 댓글 관리

#### GET `/api/study/posts/{postId}/comments`
댓글 목록 조회

**Response:**
```json
[
  {
    "id": 1,
    "postId": 1,
    "content": "좋은 내용이네요!",
    "authorId": 2,
    "authorName": "홍길동",
    "createdAt": "2026-03-28T10:00:00",
    "updatedAt": "2026-03-28T10:00:00"
  }
]
```

#### POST `/api/study/posts/{postId}/comments`
댓글 작성

```json
{
  "content": "댓글 내용"
}
```

#### PUT `/api/study/posts/{postId}/comments/{id}`
댓글 수정 (작성자만)

#### DELETE `/api/study/posts/{postId}/comments/{id}`
댓글 삭제 (작성자 또는 ROLE_ADMIN만)

---

### 4. 좋아요

#### POST `/api/study/posts/{id}/like`
좋아요 토글 (좋아요/취소)

**Response:**
```json
{
  "liked": true,
  "likeCount": 13
}
```

---

### 5. 첨부파일

#### POST `/api/study/posts/{postId}/attachments`
첨부파일 업로드 (S3)

**Request:** `multipart/form-data`
- `file`: 파일 (최대 10MB)

**Response:**
```json
{
  "id": 5,
  "postId": 1,
  "fileName": "example.png",
  "fileUrl": "https://s3.amazonaws.com/hibot-docu/study/1/example.png",
  "fileType": "image",
  "fileSize": 204800,
  "createdAt": "2026-03-28T15:00:00"
}
```

#### DELETE `/api/study/posts/{postId}/attachments/{id}`
첨부파일 삭제 (S3에서도 삭제)

---

### 6. 검색

#### GET `/api/study/posts/search`
전체 게시글 검색

**Query Parameters:**
- `keyword`: 검색 키워드 (필수)
- `categoryId`: 카테고리 필터 (선택)
- `page`, `size`

---

## 🔐 권한 체계

| 기능 | 일반 사용자 | ROLE_ADMIN |
|---|---|---|
| 게시글 목록/상세 조회 | ✅ (공개만) | ✅ (전체) |
| 게시글 작성 | ✅ | ✅ |
| 게시글 수정/삭제 | ✅ (본인만) | ✅ (전체) |
| 댓글 작성 | ✅ | ✅ |
| 댓글 수정/삭제 | ✅ (본인만) | ✅ (전체) |
| 좋아요 | ✅ | ✅ |
| 카테고리 관리 | ❌ | ✅ |
| 게시글 고정 | ❌ | ✅ |

---

## 📦 패키지 구조

```
com.mapo.palantier.study
├── domain
│   ├── StudyCategory.java
│   ├── StudyPost.java
│   ├── StudyComment.java
│   ├── StudyLike.java
│   └── StudyAttachment.java
├── repository
│   ├── StudyCategoryMapper.java
│   ├── StudyPostMapper.java
│   ├── StudyCommentMapper.java
│   ├── StudyLikeMapper.java
│   └── StudyAttachmentMapper.java
├── service
│   ├── StudyCategoryService.java
│   ├── StudyPostService.java
│   ├── StudyCommentService.java
│   └── StudyLikeService.java
├── controller
│   ├── StudyCategoryController.java
│   ├── StudyPostController.java
│   ├── StudyCommentController.java
│   └── StudyLikeController.java
└── dto
    ├── StudyCategoryDto.java
    ├── StudyPostRequest.java
    ├── StudyPostResponse.java
    ├── StudyCommentRequest.java
    ├── StudyCommentResponse.java
    └── StudyLikeResponse.java
```

**MyBatis Mapper XML 위치:**
```
resources/mappers/study/
├── StudyCategoryMapper.xml
├── StudyPostMapper.xml
├── StudyCommentMapper.xml
├── StudyLikeMapper.xml
└── StudyAttachmentMapper.xml
```

---

## 🗄️ MyBatis Mapper 예시

### StudyCategoryMapper.xml
```xml
<!-- 재귀 CTE로 카테고리 트리 조회 -->
<select id="findCategoryTree" resultType="StudyCategoryDto">
    WITH RECURSIVE category_tree AS (
        SELECT
            id, name, parent_id, icon, description, order_num,
            0 AS depth,
            ARRAY[order_num] AS path
        FROM study_categories
        WHERE parent_id IS NULL AND is_active = true

        UNION ALL

        SELECT
            c.id, c.name, c.parent_id, c.icon, c.description, c.order_num,
            ct.depth + 1,
            ct.path || c.order_num
        FROM study_categories c
        INNER JOIN category_tree ct ON c.parent_id = ct.id
        WHERE c.is_active = true
    )
    SELECT * FROM category_tree ORDER BY path
</select>
```

### StudyPostMapper.xml
```xml
<!-- 카테고리별 게시글 목록 -->
<select id="findPostsByCategory" resultType="StudyPostResponse">
    SELECT
        p.id,
        p.category_id,
        sc.name AS category_name,
        p.title,
        p.author_id,
        u.username AS author_name,
        p.is_public,
        p.view_count,
        p.is_pinned,
        p.created_at,
        p.updated_at,
        (SELECT COUNT(*) FROM study_likes WHERE post_id = p.id) AS like_count,
        (SELECT COUNT(*) FROM study_comments WHERE post_id = p.id) AS comment_count
    FROM study_posts p
    INNER JOIN study_categories sc ON p.category_id = sc.id
    INNER JOIN users u ON p.author_id = u.id
    WHERE p.category_id = #{categoryId}
      AND (p.is_public = true OR p.author_id = #{currentUserId})
    <if test="keyword != null">
      AND (p.title ILIKE CONCAT('%', #{keyword}, '%')
        OR p.content ILIKE CONCAT('%', #{keyword}, '%'))
    </if>
    ORDER BY p.is_pinned DESC, p.created_at DESC
    LIMIT #{size} OFFSET #{offset}
</select>
```

---

**작성일**: 2026-03-28
**버전**: 2.0 (study 네이밍으로 전면 개편)