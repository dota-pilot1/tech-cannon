-- V3: 리프레시 토큰 테이블 생성
-- 목적: JWT 리프레시 토큰을 DB에 저장하여 무효화 가능하게 함

CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_token_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_refresh_token_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_token_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_token_expiry_date ON refresh_tokens(expiry_date);

COMMENT ON TABLE refresh_tokens IS '리프레시 토큰 저장 테이블';
COMMENT ON COLUMN refresh_tokens.user_id IS '사용자 ID (외래키)';
COMMENT ON COLUMN refresh_tokens.token IS 'JWT 리프레시 토큰 문자열';
COMMENT ON COLUMN refresh_tokens.expiry_date IS '토큰 만료 시각';
COMMENT ON COLUMN refresh_tokens.created_at IS '토큰 발급 시각';
