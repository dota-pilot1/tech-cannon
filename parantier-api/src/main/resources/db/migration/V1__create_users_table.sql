-- Users 테이블 생성
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- BCrypt 해시값 저장
    username VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 테이블 코멘트
COMMENT ON TABLE users IS '사용자 정보 테이블';
COMMENT ON COLUMN users.id IS '사용자 ID (Primary Key)';
COMMENT ON COLUMN users.email IS '이메일 (로그인 ID로 사용)';
COMMENT ON COLUMN users.password IS 'BCrypt 암호화된 비밀번호';
COMMENT ON COLUMN users.username IS '사용자 이름';
COMMENT ON COLUMN users.role IS '사용자 권한 (ROLE_USER, ROLE_ADMIN 등)';
COMMENT ON COLUMN users.is_active IS '계정 활성화 여부';
COMMENT ON COLUMN users.created_at IS '생성일시';
COMMENT ON COLUMN users.updated_at IS '수정일시';
