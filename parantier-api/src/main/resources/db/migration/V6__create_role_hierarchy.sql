-- 권한 계층 테이블
CREATE TABLE role_hierarchy (
    parent_role VARCHAR(50) NOT NULL,
    child_role VARCHAR(50) NOT NULL,
    PRIMARY KEY (parent_role, child_role)
);

-- ROLE_ADMIN은 ROLE_USER 권한을 포함
INSERT INTO role_hierarchy (parent_role, child_role) VALUES ('ROLE_ADMIN', 'ROLE_USER');

-- 나중에 확장 가능: ROLE_SUPER_ADMIN > ROLE_ADMIN > ROLE_MANAGER > ROLE_USER
-- INSERT INTO role_hierarchy (parent_role, child_role) VALUES ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN');
-- INSERT INTO role_hierarchy (parent_role, child_role) VALUES ('ROLE_ADMIN', 'ROLE_MANAGER');
-- INSERT INTO role_hierarchy (parent_role, child_role) VALUES ('ROLE_MANAGER', 'ROLE_USER');

COMMENT ON TABLE role_hierarchy IS '권한 계층 구조 (parent_role이 child_role의 권한을 포함)';
