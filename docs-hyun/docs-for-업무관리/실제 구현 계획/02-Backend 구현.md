# Backend 구현 계획

## 디렉토리 구조

```
parantier-api/src/main/java/com/palantier/
├── domain/
│   └── task/
│       ├── folder/
│       │   ├── TaskFolder.java
│       │   ├── TaskFolderMapper.java
│       │   ├── TaskFolderService.java
│       │   └── TaskFolderController.java
│       ├── post/
│       │   ├── TaskPost.java
│       │   ├── TaskPostMapper.java
│       │   ├── TaskPostService.java
│       │   └── TaskPostController.java
│       ├── block/
│       │   ├── TaskBlock.java
│       │   ├── BlockType.java (enum)
│       │   └── TaskBlockMapper.java
│       └── comment/
│           ├── TaskComment.java
│           ├── TaskCommentMapper.java
│           ├── TaskCommentService.java
│           └── TaskCommentController.java
└── dto/
    └── task/
        ├── TaskFolderDto.java
        ├── TaskPostDto.java
        ├── TaskBlockDto.java
        └── TaskCommentDto.java
```

---

## API 엔드포인트

### Task Folder API
```
GET    /api/tasks/folders              - 폴더 목록 조회
GET    /api/tasks/folders/{id}         - 폴더 상세
POST   /api/tasks/folders              - 폴더 생성
PUT    /api/tasks/folders/{id}         - 폴더 수정 (이름 변경)
DELETE /api/tasks/folders/{id}         - 폴더 삭제 (Soft Delete)
```

### Task Post API
```
GET    /api/tasks/posts?folderId={id}  - 특정 폴더의 게시글 목록
GET    /api/tasks/posts/{id}           - 게시글 상세 (블록 포함)
POST   /api/tasks/posts                - 게시글 생성
PUT    /api/tasks/posts/{id}           - 게시글 수정
DELETE /api/tasks/posts/{id}           - 게시글 삭제
```

### Task Comment API
```
GET    /api/tasks/posts/{postId}/comments     - 댓글 목록
POST   /api/tasks/posts/{postId}/comments     - 댓글 작성
DELETE /api/tasks/comments/{id}               - 댓글 삭제
```

---

## 도메인 모델

### TaskFolder.java
```java
@Data
public class TaskFolder {
    private Long id;
    private Long organizationId;
    private Long parentId;
    private String name;
    private Integer sortOrder;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
```

### TaskPost.java
```java
@Data
public class TaskPost {
    private Long id;
    private Long folderId;
    private String title;
    private Long authorId;
    private String authorName; // JOIN
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    private List<TaskBlock> blocks; // 상세 조회 시
}
```

### TaskBlock.java
```java
@Data
public class TaskBlock {
    private Long id;
    private Long postId;
    private BlockType blockType;
    private String content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### BlockType.java
```java
public enum BlockType {
    NOTE,       // 마크다운 텍스트
    MMD,        // Mermaid 다이어그램
    FIGMA,      // Figma URL
    FILE,       // 파일 (JSON)
    DBTABLE     // DB 테이블 정의 (JSON)
}
```

---

## MyBatis Mapper

### TaskFolderMapper.xml
```xml
<select id="findAll" resultType="TaskFolder">
    SELECT id, organization_id, parent_id, name, sort_order,
           created_by, created_at, updated_at
    FROM task_folders
    WHERE organization_id = #{organizationId}
      AND deleted_at IS NULL
    ORDER BY parent_id NULLS FIRST, sort_order
</select>

<insert id="insert" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO task_folders (organization_id, parent_id, name, sort_order, created_by)
    VALUES (#{organizationId}, #{parentId}, #{name}, #{sortOrder}, #{createdBy})
</insert>
```

### TaskPostMapper.xml
```xml
<select id="findByFolderId" resultType="TaskPost">
    SELECT p.id, p.folder_id, p.title, p.author_id,
           u.username as author_name,
           p.created_at, p.updated_at
    FROM task_posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.folder_id = #{folderId}
      AND p.deleted_at IS NULL
    ORDER BY p.updated_at DESC
</select>

<select id="findByIdWithBlocks" resultMap="PostWithBlocks">
    SELECT p.id, p.folder_id, p.title, p.author_id,
           u.username as author_name,
           p.created_at, p.updated_at,
           b.id as block_id, b.block_type, b.content, b.sort_order
    FROM task_posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN task_blocks b ON p.id = b.post_id
    WHERE p.id = #{id} AND p.deleted_at IS NULL
    ORDER BY b.sort_order
</select>

<resultMap id="PostWithBlocks" type="TaskPost">
    <id property="id" column="id"/>
    <result property="folderId" column="folder_id"/>
    <result property="title" column="title"/>
    <result property="authorId" column="author_id"/>
    <result property="authorName" column="author_name"/>
    <collection property="blocks" ofType="TaskBlock">
        <id property="id" column="block_id"/>
        <result property="blockType" column="block_type"/>
        <result property="content" column="content"/>
        <result property="sortOrder" column="sort_order"/>
    </collection>
</resultMap>
```

---

## Service 레이어

### TaskPostService.java
```java
@Service
@Transactional
public class TaskPostService {

    @Autowired
    private TaskPostMapper postMapper;

    @Autowired
    private TaskBlockMapper blockMapper;

    public TaskPost getPostWithBlocks(Long id) {
        return postMapper.findByIdWithBlocks(id);
    }

    public Long savePost(TaskPostDto dto) {
        TaskPost post = new TaskPost();
        post.setFolderId(dto.getFolderId());
        post.setTitle(dto.getTitle());
        post.setAuthorId(getCurrentUserId());

        if (dto.getId() == null) {
            postMapper.insert(post);
        } else {
            post.setId(dto.getId());
            postMapper.update(post);
            blockMapper.deleteByPostId(post.getId());
        }

        // 블록 저장
        for (int i = 0; i < dto.getBlocks().size(); i++) {
            TaskBlock block = dto.getBlocks().get(i);
            block.setPostId(post.getId());
            block.setSortOrder(i);
            blockMapper.insert(block);
        }

        return post.getId();
    }

    public void deletePost(Long id) {
        postMapper.softDelete(id);
    }
}
```

---

## DTO

### TaskPostDto.java
```java
@Data
public class TaskPostDto {
    private Long id;
    private Long folderId;
    private String title;
    private List<TaskBlockDto> blocks;
}

@Data
public class TaskBlockDto {
    private String blockType; // NOTE, MMD, FIGMA, FILE, DBTABLE
    private String content;
}
```

---

## 다음 단계
1. 테이블 생성 SQL 실행
2. 도메인 모델 작성
3. MyBatis Mapper 작성
4. Service & Controller 구현
5. Postman 테스트
