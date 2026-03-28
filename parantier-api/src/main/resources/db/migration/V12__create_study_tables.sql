-- ================================================================
-- V12: 스터디 포럼 테이블 생성
-- ================================================================

-- 1. study_categories (카테고리)
CREATE TABLE study_categories (
    id          bigserial    PRIMARY KEY,
    name        varchar(100) NOT NULL,
    parent_id   bigint       REFERENCES study_categories(id) ON DELETE CASCADE,
    icon        varchar(50),
    description text,
    order_num   integer      NOT NULL DEFAULT 0,
    is_active   boolean      NOT NULL DEFAULT true,
    created_at  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_study_categories_parent_id ON study_categories(parent_id);
CREATE INDEX idx_study_categories_order     ON study_categories(order_num);

-- 2. study_posts (게시글)
CREATE TABLE study_posts (
    id          bigserial    PRIMARY KEY,
    category_id bigint       NOT NULL REFERENCES study_categories(id) ON DELETE CASCADE,
    title       varchar(200) NOT NULL,
    content     text,
    author_id   bigint       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public   boolean      NOT NULL DEFAULT true,
    view_count  integer      NOT NULL DEFAULT 0,
    is_pinned   boolean      NOT NULL DEFAULT false,
    created_at  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_study_posts_category_id ON study_posts(category_id);
CREATE INDEX idx_study_posts_author_id   ON study_posts(author_id);
CREATE INDEX idx_study_posts_created_at  ON study_posts(created_at DESC);
CREATE INDEX idx_study_posts_is_pinned   ON study_posts(is_pinned);

-- 3. study_comments (댓글)
CREATE TABLE study_comments (
    id         bigserial PRIMARY KEY,
    post_id    bigint    NOT NULL REFERENCES study_posts(id) ON DELETE CASCADE,
    author_id  bigint    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    text      NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_study_comments_post_id ON study_comments(post_id);

-- 4. study_likes (좋아요)
CREATE TABLE study_likes (
    id         bigserial PRIMARY KEY,
    post_id    bigint    NOT NULL REFERENCES study_posts(id) ON DELETE CASCADE,
    user_id    bigint    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_id, user_id)
);

CREATE INDEX idx_study_likes_post_id ON study_likes(post_id);

-- 5. study_attachments (첨부파일)
CREATE TABLE study_attachments (
    id           bigserial    PRIMARY KEY,
    post_id      bigint       NOT NULL REFERENCES study_posts(id) ON DELETE CASCADE,
    filename     varchar(255) NOT NULL,
    url          text         NOT NULL,
    content_type varchar(100),
    file_size    bigint,
    created_at   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_study_attachments_post_id ON study_attachments(post_id);
