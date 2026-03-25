-- Step 1: Create role table
CREATE TABLE role (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE role IS '역할 테이블 (RBAC)';
COMMENT ON COLUMN role.name IS '역할 이름 (예: ADMIN, MANAGER, MEMBER)';
COMMENT ON COLUMN role.description IS '역할 설명';

-- Step 2: Insert existing roles from role_authority
INSERT INTO role (name, description) VALUES
('ROLE_ADMIN', '시스템 관리자 - 모든 권한 보유'),
('ROLE_USER', '일반 사용자 - 기본 권한만 보유');

-- Step 3: Create temporary backup of role_authority
CREATE TABLE role_authority_backup AS SELECT * FROM role_authority;

-- Step 4: Drop and recreate role_authority with proper foreign key
DROP TABLE role_authority;

CREATE TABLE role_authority (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL,
    authority_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, authority_id),
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE,
    FOREIGN KEY (authority_id) REFERENCES authority(id) ON DELETE CASCADE
);

COMMENT ON TABLE role_authority IS '역할-권한 매핑 테이블';

-- Step 5: Migrate data from backup to new role_authority
INSERT INTO role_authority (role_id, authority_id)
SELECT r.id, rab.authority_id
FROM role_authority_backup rab
JOIN role r ON r.name = rab.role;

-- Step 6: Drop backup table
DROP TABLE role_authority_backup;

-- Step 7: Create user_role table
CREATE TABLE user_role (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    granted_at TIMESTAMP DEFAULT NOW(),
    granted_by VARCHAR(100),
    UNIQUE(user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);

COMMENT ON TABLE user_role IS '사용자-역할 매핑 테이블';
COMMENT ON COLUMN user_role.granted_by IS '역할을 부여한 관리자 username';

-- Step 8: Migrate existing user roles from user table
-- Assuming admin@example.com should have ROLE_ADMIN
INSERT INTO user_role (user_id, role_id, granted_by)
SELECT u.id, r.id, 'system'
FROM "user" u
CROSS JOIN role r
WHERE u.username = 'admin@example.com' AND r.name = 'ROLE_ADMIN';

-- All other users get ROLE_USER by default
INSERT INTO user_role (user_id, role_id, granted_by)
SELECT u.id, r.id, 'system'
FROM "user" u
CROSS JOIN role r
WHERE u.username != 'admin@example.com' AND r.name = 'ROLE_USER'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Step 9: Create user_authority table (MAIN: 사용자가 직접 보유한 권한)
CREATE TABLE user_authority (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    authority_id BIGINT NOT NULL,
    granted_by VARCHAR(100),
    granted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, authority_id),
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    FOREIGN KEY (authority_id) REFERENCES authority(id) ON DELETE CASCADE
);

COMMENT ON TABLE user_authority IS '[메인] 사용자가 직접 보유한 권한';
COMMENT ON COLUMN user_authority.granted_by IS '권한을 부여한 관리자 username';

-- Step 10: Migrate existing user_role data to user_authority
-- 기존 user_role에서 각 역할의 권한들을 user_authority로 복사
INSERT INTO user_authority (user_id, authority_id, granted_by, granted_at)
SELECT DISTINCT ur.user_id, ra.authority_id, ur.granted_by, ur.granted_at
FROM user_role ur
JOIN role_authority ra ON ur.role_id = ra.role_id
ON CONFLICT (user_id, authority_id) DO NOTHING;

-- Step 11: Create indexes for performance
CREATE INDEX idx_role_authority_role_id ON role_authority(role_id);
CREATE INDEX idx_role_authority_authority_id ON role_authority(authority_id);
CREATE INDEX idx_user_role_user_id ON user_role(user_id);
CREATE INDEX idx_user_role_role_id ON user_role(role_id);
CREATE INDEX idx_user_authority_user_id ON user_authority(user_id);
CREATE INDEX idx_user_authority_authority_id ON user_authority(authority_id);
