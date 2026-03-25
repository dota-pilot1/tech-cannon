-- ========================================
-- Task Management System Tables
-- ========================================

-- 1. task_folders (업무 폴더)
CREATE TABLE task_folders (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT NULL,
    name VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_folder_parent FOREIGN KEY (parent_id)
        REFERENCES task_folders(id) ON DELETE CASCADE,
    CONSTRAINT fk_folder_creator FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_folder_parent ON task_folders(parent_id);
CREATE INDEX idx_folder_sort ON task_folders(sort_order);
CREATE INDEX idx_folder_active ON task_folders(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE task_folders IS '업무 폴더 (계층 구조)';
COMMENT ON COLUMN task_folders.parent_id IS '상위 폴더 ID (NULL이면 루트)';
COMMENT ON COLUMN task_folders.sort_order IS '정렬 순서';

-- ========================================

-- 2. task_posts (업무 게시글)
CREATE TABLE task_posts (
    id BIGSERIAL PRIMARY KEY,
    folder_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    author_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_post_folder FOREIGN KEY (folder_id)
        REFERENCES task_folders(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_author FOREIGN KEY (author_id)
        REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_post_folder ON task_posts(folder_id);
CREATE INDEX idx_post_author ON task_posts(author_id);
CREATE INDEX idx_post_updated ON task_posts(updated_at DESC);
CREATE INDEX idx_post_active ON task_posts(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE task_posts IS '업무 게시글';
COMMENT ON COLUMN task_posts.title IS '게시글 제목';

-- ========================================

-- 3. task_blocks (업무 본문 블록)
CREATE TABLE task_blocks (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    block_type VARCHAR(20) NOT NULL,
    content TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_block_post FOREIGN KEY (post_id)
        REFERENCES task_posts(id) ON DELETE CASCADE,
    CONSTRAINT chk_block_type CHECK (block_type IN ('NOTE', 'MMD', 'FIGMA', 'FILE', 'DBTABLE'))
);

CREATE INDEX idx_block_post ON task_blocks(post_id);
CREATE INDEX idx_block_sort ON task_blocks(post_id, sort_order);

COMMENT ON TABLE task_blocks IS '업무 게시글 본문 블록';
COMMENT ON COLUMN task_blocks.block_type IS '블록 타입: NOTE(노트), MMD(다이어그램), FIGMA(임베드), FILE(파일), DBTABLE(DB테이블)';
COMMENT ON COLUMN task_blocks.content IS '블록 내용 (JSON 또는 텍스트)';
COMMENT ON COLUMN task_blocks.sort_order IS '블록 정렬 순서';

-- ========================================

-- 4. task_comments (댓글)
CREATE TABLE task_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_comment_post FOREIGN KEY (post_id)
        REFERENCES task_posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_author FOREIGN KEY (author_id)
        REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_comment_post ON task_comments(post_id);
CREATE INDEX idx_comment_author ON task_comments(author_id);
CREATE INDEX idx_comment_created ON task_comments(created_at DESC);
CREATE INDEX idx_comment_active ON task_comments(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE task_comments IS '업무 게시글 댓글';

-- ========================================
-- Sample Data
-- ========================================

-- 샘플 폴더 (admin 사용자 기준)
INSERT INTO task_folders (parent_id, name, sort_order, created_by) VALUES
(NULL, '개발팀', 1, 1),
(NULL, '디자인팀', 2, 1),
(1, 'Backend', 1, 1),
(1, 'Frontend', 2, 1);

-- 샘플 게시글
INSERT INTO task_posts (folder_id, title, author_id) VALUES
(3, 'Spring Boot 업그레이드 계획', 1),
(3, 'API 성능 최적화', 1),
(4, 'React 19 마이그레이션', 1);

-- 샘플 블록
INSERT INTO task_blocks (post_id, block_type, content, sort_order) VALUES
(1, 'NOTE', 'Spring Boot 3.4.3 → 4.0 업그레이드 계획

## 주요 변경사항
- Java 17 → Java 21
- Spring Security 업데이트
- MyBatis 호환성 확인

## 일정
- 1주차: 로컬 테스트
- 2주차: 스테이징 배포
- 3주차: 프로덕션 적용', 0),

(1, 'MMD', 'flowchart TD
    A[현재: Boot 3.4.3] --> B[의존성 체크]
    B --> C[Java 21 업그레이드]
    C --> D[로컬 테스트]
    D --> E[스테이징 배포]
    E --> F[프로덕션 배포]', 1),

(2, 'NOTE', 'API 응답 시간 최적화

## 현재 문제
- /api/users 엔드포인트: 평균 800ms
- JOIN 쿼리 과다

## 개선 방안
- 쿼리 최적화 (N+1 문제 해결)
- Redis 캐싱 도입
- DB 인덱스 추가', 0),

(3, 'NOTE', 'React 19 마이그레이션 체크리스트

- [x] package.json 업데이트
- [ ] React Compiler 적용
- [ ] use() hook 활용
- [ ] Server Components 검토', 0);

-- 샘플 댓글
INSERT INTO task_comments (post_id, author_id, content) VALUES
(1, 1, 'Java 21의 Virtual Threads도 고려해볼까요?'),
(2, 1, 'Redis 캐싱 TTL은 얼마로 설정할 예정인가요?');
