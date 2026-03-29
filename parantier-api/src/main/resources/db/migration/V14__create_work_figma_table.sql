CREATE TABLE work_figmas (
    id          BIGSERIAL PRIMARY KEY,
    work_id     BIGINT        NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    title       VARCHAR(255)  NOT NULL,
    url         TEXT          NOT NULL,
    description TEXT,
    order_num   INTEGER       NOT NULL DEFAULT 0,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_work_figmas_work_id ON work_figmas(work_id);
