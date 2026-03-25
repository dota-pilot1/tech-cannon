-- 역할 관리 메뉴 추가

-- 1. 역할 관리 메뉴 추가 (관리 카테고리 하위에)
INSERT INTO menus (id, name, path, parent_id, menu_type, order_num, required_role, icon)
VALUES (14, '역할 관리', '/admin/roles', 2, 'PAGE', 2, 'ADMIN', 'Shield')
ON CONFLICT (id) DO NOTHING;

-- 2. 메뉴 순서 재조정 (역할 관리를 2번째로 배치)
UPDATE menus SET order_num = 1 WHERE id = 10; -- 유저 관리
UPDATE menus SET order_num = 2 WHERE id = 14; -- 역할 관리 (신규)
UPDATE menus SET order_num = 3 WHERE id = 13; -- 조직 관리
UPDATE menus SET order_num = 4 WHERE id = 12; -- 권한 관리
UPDATE menus SET order_num = 5 WHERE id = 11; -- 메뉴 관리
