-- 권한 관리 메뉴 추가 (관리자 하위)
INSERT INTO menus (id, name, path, parent_id, menu_type, order_num, required_role, icon) VALUES
(12, '권한 관리', '/admin/authorities', 2, 'SIDE', 3, 'ADMIN', 'Shield');
