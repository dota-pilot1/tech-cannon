-- 메뉴 구조 리팩토링: 관리자 → 관리 (CATEGORY), 메뉴 타입 변경

-- 1. "관리자" 메뉴를 "관리" CATEGORY로 변경
UPDATE menus
SET name = '관리',
    menu_type = 'CATEGORY',
    path = NULL  -- CATEGORY는 path가 없음
WHERE id = 2;

-- 2. 하위 메뉴들의 menu_type을 SIDE에서 PAGE로 변경
UPDATE menus
SET menu_type = 'PAGE'
WHERE parent_id = 2 AND menu_type = 'SIDE';

-- 3. 조직 관리 메뉴 추가
INSERT INTO menus (id, name, path, parent_id, menu_type, order_num, required_role, icon)
VALUES (13, '조직 관리', '/admin/organizations', 2, 'PAGE', 4, 'ADMIN', 'Building2')
ON CONFLICT (id) DO NOTHING;

-- 4. 메뉴 순서 재조정
UPDATE menus SET order_num = 1 WHERE id = 10; -- 유저 관리
UPDATE menus SET order_num = 2 WHERE id = 13; -- 조직 관리
UPDATE menus SET order_num = 3 WHERE id = 12; -- 권한 관리
UPDATE menus SET order_num = 4 WHERE id = 11; -- 메뉴 관리
