-- 권한 테이블
CREATE TABLE authority (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,  -- 예: PROJECT:CREATE
    description VARCHAR(255),
    category VARCHAR(50),                -- 예: MENU, PROJECT, USER
    created_at TIMESTAMP DEFAULT NOW()
);

-- 역할-권한 매핑 테이블
CREATE TABLE role_authority (
    role VARCHAR(50) NOT NULL,           -- ROLE_ADMIN, ROLE_USER 등
    authority_id BIGINT NOT NULL,
    PRIMARY KEY (role, authority_id),
    FOREIGN KEY (authority_id) REFERENCES authority(id) ON DELETE CASCADE
);

-- 기본 권한 데이터 삽입
INSERT INTO authority (name, description, category) VALUES
-- 메뉴 접근 권한
('MENU:DASHBOARD:READ', '대시보드 메뉴 읽기', 'MENU'),
('MENU:ADMIN:READ', '관리자 메뉴 읽기', 'MENU'),
('MENU:ADMIN:WRITE', '관리자 메뉴 쓰기', 'MENU'),
('MENU:PROJECT:READ', '프로젝트 메뉴 읽기', 'MENU'),

-- 프로젝트 관리 권한
('PROJECT:CREATE', '프로젝트 생성', 'PROJECT'),
('PROJECT:READ', '프로젝트 읽기', 'PROJECT'),
('PROJECT:UPDATE', '프로젝트 수정', 'PROJECT'),
('PROJECT:DELETE', '프로젝트 삭제', 'PROJECT'),

-- 사용자 관리 권한
('USER:CREATE', '사용자 생성', 'USER'),
('USER:READ', '사용자 읽기', 'USER'),
('USER:UPDATE', '사용자 수정', 'USER'),
('USER:DELETE', '사용자 삭제', 'USER'),
('USER:ROLE_CHANGE', '사용자 역할 변경', 'USER'),

-- 기타 권한
('DASHBOARD:VIEW', '대시보드 조회', 'DASHBOARD'),
('REPORT:EXPORT', '리포트 내보내기', 'REPORT'),
('SETTINGS:MANAGE', '설정 관리', 'SETTINGS');

-- ROLE_ADMIN 권한 매핑 (모든 권한)
INSERT INTO role_authority (role, authority_id)
SELECT 'ROLE_ADMIN', id FROM authority;

-- ROLE_USER 권한 매핑 (기본 권한만)
INSERT INTO role_authority (role, authority_id)
SELECT 'ROLE_USER', id FROM authority
WHERE name IN (
    'MENU:DASHBOARD:READ',
    'MENU:PROJECT:READ',
    'PROJECT:READ',
    'DASHBOARD:VIEW'
);
