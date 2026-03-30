-- works.due_date: DATE → TIMESTAMP 변경
-- 기존 DATE 값은 자동으로 00:00:00 시간으로 변환됨

ALTER TABLE works
    ALTER COLUMN due_date TYPE TIMESTAMP
    USING due_date::TIMESTAMP;
