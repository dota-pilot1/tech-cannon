-- 메뉴 관리 테이블 생성
CREATE TABLE menus (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    path VARCHAR(255),
    parent_id BIGINT REFERENCES menus(id) ON DELETE CASCADE,
    menu_type VARCHAR(20) NOT NULL,
    order_num INT NOT NULL DEFAULT 0,
    required_role VARCHAR(20),
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_menus_parent_id ON menus(parent_id);
CREATE INDEX idx_menus_order ON menus(order_num);
CREATE INDEX idx_menus_active ON menus(is_active);

-- 초기 데이터: 헤더 메뉴
INSERT INTO menus (id, name, path, parent_id, menu_type, order_num, required_role, icon) VALUES
(1, '대시보드', '/dashboard', NULL, 'HEADER', 1, 'USER', 'Home'),
(2, '관리자', '/admin', NULL, 'HEADER', 2, 'ADMIN', 'Settings');

-- 초기 데이터: 사이드 메뉴 (관리자 하위)
INSERT INTO menus (id, name, path, parent_id, menu_type, order_num, required_role, icon) VALUES
(10, '유저 관리', '/admin/users', 2, 'SIDE', 1, 'ADMIN', 'Users'),
(11, '메뉴 관리', '/admin/menus', 2, 'SIDE', 2, 'ADMIN', 'Menu');

-- 시퀀스 조정 (향후 메뉴 추가를 위해)
SELECT setval('menus_id_seq', 100);
