CREATE TABLE work_messages (
    id          BIGSERIAL PRIMARY KEY,
    work_id     BIGINT        NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    user_id     BIGINT        NOT NULL REFERENCES users(id),
    message     TEXT          NOT NULL,
    is_deleted  BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_work_messages_work_id ON work_messages(work_id);
CREATE INDEX idx_work_messages_user_id ON work_messages(user_id);
