-- 이슈 관리 테이블 생성 SQL
-- 실행: docker exec -i palantier-postgres psql -U palantier_user -d palantier < create-tables.sql

-- 1. issues 테이블
CREATE TABLE IF NOT EXISTS issues (
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

    CONSTRAINT fk_issue_author FOREIGN KEY (author_id) REFERENCES users(id),
    CONSTRAINT fk_issue_assignee FOREIGN KEY (assignee_id) REFERENCES users(id),
    CONSTRAINT fk_issue_organization FOREIGN KEY (organization_id) REFERENCES organization(id),
    CONSTRAINT fk_issue_folder FOREIGN KEY (folder_id) REFERENCES task_folders(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_assignee ON issues(assignee_id);
CREATE INDEX IF NOT EXISTS idx_issues_created ON issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_folder ON issues(folder_id);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);

COMMENT ON TABLE issues IS '이슈 관리 테이블';
COMMENT ON COLUMN issues.category IS 'COMMON, BUG, FEATURE, IMPROVEMENT, QUESTION';
COMMENT ON COLUMN issues.status IS 'OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED';
COMMENT ON COLUMN issues.priority IS 'LOW, MEDIUM, HIGH, CRITICAL';

-- 2. issue_comments 테이블
CREATE TABLE IF NOT EXISTS issue_comments (
    id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_comment_issue FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_issue_comments_issue ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_created ON issue_comments(created_at DESC);

COMMENT ON TABLE issue_comments IS '이슈 댓글 테이블';

-- 3. issue_checklists 테이블
CREATE TABLE IF NOT EXISTS issue_checklists (
    id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    checked BOOLEAN DEFAULT FALSE NOT NULL,
    order_num INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_checklist_issue FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_issue_checklists_issue ON issue_checklists(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_checklists_order ON issue_checklists(issue_id, order_num);

COMMENT ON TABLE issue_checklists IS '이슈 체크리스트 테이블';

-- 4. issue_attachments 테이블
CREATE TABLE IF NOT EXISTS issue_attachments (
    id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    content_type VARCHAR(100),
    uploaded_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_attachment_issue FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    CONSTRAINT fk_attachment_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_issue_attachments_issue ON issue_attachments(issue_id);

COMMENT ON TABLE issue_attachments IS '이슈 첨부파일 테이블';

-- 샘플 데이터 (테스트용)
INSERT INTO issues (title, content, category, status, priority, author_id, assignee_id)
VALUES
    ('로그인 페이지 오류 수정 필요', '이메일 입력 필드 유효성 검사가 제대로 작동하지 않습니다.', 'BUG', 'OPEN', 'HIGH', 1, 2),
    ('대시보드 차트 기능 추가', '사용자 통계를 시각화할 수 있는 차트를 추가해주세요.', 'FEATURE', 'IN_PROGRESS', 'MEDIUM', 1, 1),
    ('API 응답 속도 개선', '일부 API의 응답 속도가 느립니다. 최적화가 필요합니다.', 'IMPROVEMENT', 'OPEN', 'MEDIUM', 2, NULL),
    ('사용자 매뉴얼 작성', '신규 사용자를 위한 매뉴얼이 필요합니다.', 'COMMON', 'OPEN', 'LOW', 1, NULL),
    ('검색 기능 오류', '특정 키워드 검색 시 오류가 발생합니다.', 'BUG', 'RESOLVED', 'CRITICAL', 2, 1)
ON CONFLICT DO NOTHING;
