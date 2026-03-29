-- ========================================
-- Work Management System Tables
-- ========================================

-- works (메인)
CREATE TABLE works (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    content         TEXT,
    work_type       VARCHAR(20)  NOT NULL DEFAULT 'COMMON',
    status          VARCHAR(20)  NOT NULL DEFAULT 'TODO',
    priority        VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    reporter_id     BIGINT       NOT NULL REFERENCES users(id),
    assignee_id     BIGINT       REFERENCES users(id),
    organization_id BIGINT       REFERENCES organization(id),
    due_date        DATE,
    order_num       INTEGER,
    is_archived     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- work_checklists
CREATE TABLE work_checklists (
    id             BIGSERIAL PRIMARY KEY,
    work_id        BIGINT       NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    content        VARCHAR(500) NOT NULL,
    is_checked     BOOLEAN      NOT NULL DEFAULT FALSE,
    image_url      TEXT,
    image_filename VARCHAR(255),
    order_num      INTEGER      NOT NULL DEFAULT 0,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- work_images
CREATE TABLE work_images (
    id          BIGSERIAL PRIMARY KEY,
    work_id     BIGINT        NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    url         TEXT          NOT NULL,
    filename    VARCHAR(255)  NOT NULL,
    file_type   VARCHAR(100),
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- work_mindmaps
CREATE TABLE work_mindmaps (
    id          BIGSERIAL PRIMARY KEY,
    work_id     BIGINT        NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    title       VARCHAR(255),
    content     TEXT          NOT NULL DEFAULT '',
    order_num   INTEGER       NOT NULL DEFAULT 0,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- work_dbtables
CREATE TABLE work_dbtables (
    id          BIGSERIAL PRIMARY KEY,
    work_id     BIGINT        NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    table_name  VARCHAR(255),
    table_info  TEXT          NOT NULL DEFAULT '{}',
    order_num   INTEGER       NOT NULL DEFAULT 0,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- work_linked_issues
CREATE TABLE work_linked_issues (
    id          BIGSERIAL PRIMARY KEY,
    work_id     BIGINT        NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    issue_id    BIGINT        NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    UNIQUE (work_id, issue_id)
);

-- 인덱스
CREATE INDEX idx_works_reporter_id   ON works(reporter_id);
CREATE INDEX idx_works_assignee_id   ON works(assignee_id);
CREATE INDEX idx_works_status        ON works(status);
CREATE INDEX idx_works_work_type     ON works(work_type);
CREATE INDEX idx_works_is_archived   ON works(is_archived);
