# SQL로 메뉴 추가/수정

Docker를 통해 PostgreSQL에 접속하여 `menus` 테이블을 직접 조작하는 방법입니다.

---

## DB 접속 방법

```bash
docker exec palantier-postgres psql -U palantier_user -d palantier -c "SQL문"
```

> ⚠️ `-it` 옵션은 TTY 오류가 발생하므로 `-c "SQL문"` 방식으로 직접 실행

---

## 전체 메뉴 조회

```sql
SELECT id, name, path, menu_type, order_num
FROM menus
ORDER BY parent_id NULLS FIRST, order_num;
```

---

## 메뉴 수정 (이름 / 경로 변경)

```sql
UPDATE menus
SET name = '변경할이름', path = '/변경할경로', updated_at = CURRENT_TIMESTAMP
WHERE id = 메뉴ID;
```

### 실제 작업 예시

#### Core → Backend 변경 (2025년)

```sql
UPDATE menus
SET name = 'Backend', path = '/backend', updated_at = CURRENT_TIMESTAMP
WHERE id = 60;
```

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| name | Core | Backend |
| path | /core | /backend |

---

## 최상위 메뉴 추가 (HEADER)

```sql
INSERT INTO menus (name, path, menu_type, order_num, required_role, icon)
VALUES ('메뉴이름', '/경로', 'HEADER', 순서, 'ROLE_USER', '아이콘명');
```

---

## 하위 메뉴 추가 (SUB)

```sql
-- 1단계: 부모 메뉴 ID 확인
SELECT id, name FROM menus WHERE name = '부모메뉴이름';

-- 2단계: 하위 메뉴 추가
INSERT INTO menus (name, path, parent_id, menu_type, order_num, required_role)
VALUES ('하위메뉴이름', '/경로', 부모ID, 'SUB', 순서, 'ROLE_USER');
```

---

## 메뉴 삭제

```sql
DELETE FROM menus WHERE id = 메뉴ID;
```

> ⚠️ 하위 메뉴가 있으면 ON DELETE CASCADE로 함께 삭제됨

---

## 주의사항

- 메뉴 경로(path) 변경 시 **프론트엔드 라우트**도 함께 수정해야 함
  - `parantier-front/src/app/routes/index.tsx` 에서 해당 route의 `path` 수정
  - 페이지 컴포넌트 파일명/폴더명도 함께 변경 권장
- `order_num`은 같은 계층(parent_id가 같은) 메뉴끼리만 적용됨
- `required_role` 이 NULL 이면 로그인한 모든 사용자 접근 가능