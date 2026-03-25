# 메뉴 관리 with DB

## 작성 날짜
2026-03-23

---

## 핵심 질문

### Q1: 메뉴 관리용 DB는 하나면 충분해?

**A: 네, 하나로 충분합니다!**

계층 구조(self-join)를 사용하면 헤더 메뉴, 사이드 메뉴, 서브 메뉴까지 모두 표현 가능합니다.

### Q2: 헤더 메뉴에 소속되는 사이드 메뉴는 어떻게 구현?

**A: `parent_id`를 이용한 계층 구조**

```
헤더 메뉴 (parent_id = NULL)
  └─ 사이드 메뉴 (parent_id = 헤더 메뉴 ID)
      └─ 서브 메뉴 (parent_id = 사이드 메뉴 ID)
```

---

## 1. 테이블 설계

### 단일 테이블로 모든 메뉴 관리

```sql
CREATE TABLE menus (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,              -- 메뉴 이름
  path VARCHAR(255),                       -- 라우팅 경로 (/admin/users)
  parent_id BIGINT REFERENCES menus(id),   -- 부모 메뉴 ID (NULL이면 최상위)
  menu_type VARCHAR(20) NOT NULL,          -- 'HEADER' | 'SIDE' | 'SUB'
  order_num INT NOT NULL DEFAULT 0,        -- 정렬 순서
  required_role VARCHAR(20),               -- 'USER' | 'ADMIN' (NULL이면 공개)
  icon VARCHAR(50),                        -- 아이콘 이름
  is_active BOOLEAN DEFAULT true,          -- 활성화 여부
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_menus_parent_id ON menus(parent_id);
CREATE INDEX idx_menus_order ON menus(order_num);
CREATE INDEX idx_menus_active ON menus(is_active);
```

---

## 2. 데이터 예시

### 실제 메뉴 구조

```sql
-- 1. 헤더 메뉴 (최상위)
INSERT INTO menus (id, name, path, parent_id, menu_type, order_num, required_role, icon) VALUES
(1, '대시보드', '/dashboard', NULL, 'HEADER', 1, 'USER', 'Home'),
(2, '관리자', '/admin', NULL, 'HEADER', 2, 'ADMIN', 'Settings');

-- 2. 사이드 메뉴 (헤더의 자식)
INSERT INTO menus (id, name, path, parent_id, menu_type, order_num, required_role, icon) VALUES
(10, '유저 관리', '/admin/users', 2, 'SIDE', 1, 'ADMIN', 'Users'),
(11, '메뉴 관리', '/admin/menus', 2, 'SIDE', 2, 'ADMIN', 'Menu'),
(12, '프로젝트 관리', '/admin/projects', 2, 'SIDE', 3, 'ADMIN', 'FolderOpen');

-- 3. 서브 메뉴 (사이드의 자식, 필요 시)
INSERT INTO menus (id, name, path, parent_id, menu_type, order_num, required_role, icon) VALUES
(100, '유저 목록', '/admin/users/list', 10, 'SUB', 1, 'ADMIN', NULL),
(101, '유저 통계', '/admin/users/stats', 10, 'SUB', 2, 'ADMIN', NULL);
```

**계층 구조:**
```
관리자 (HEADER, id=2)
  ├─ 유저 관리 (SIDE, id=10, parent_id=2)
  │   ├─ 유저 목록 (SUB, id=100, parent_id=10)
  │   └─ 유저 통계 (SUB, id=101, parent_id=10)
  ├─ 메뉴 관리 (SIDE, id=11, parent_id=2)
  └─ 프로젝트 관리 (SIDE, id=12, parent_id=2)
```

---

## 3. 조회 쿼리

### 3.1 헤더 메뉴 조회

```sql
-- 최상위 메뉴만 (parent_id가 NULL)
SELECT * FROM menus
WHERE parent_id IS NULL
  AND is_active = true
  AND (required_role IS NULL OR required_role = 'ADMIN')  -- 권한 체크
ORDER BY order_num;
```

### 3.2 특정 헤더의 사이드 메뉴 조회

```sql
-- '관리자' 헤더(id=2)의 사이드 메뉴들
SELECT * FROM menus
WHERE parent_id = 2
  AND is_active = true
  AND menu_type = 'SIDE'
ORDER BY order_num;
```

### 3.3 전체 메뉴 트리 조회 (재귀 쿼리)

```sql
-- PostgreSQL Recursive CTE
WITH RECURSIVE menu_tree AS (
  -- 1. 최상위 메뉴 (헤더)
  SELECT
    id, name, path, parent_id, menu_type, order_num,
    required_role, icon, is_active,
    1 as depth,
    ARRAY[order_num] as sort_path
  FROM menus
  WHERE parent_id IS NULL AND is_active = true

  UNION ALL

  -- 2. 자식 메뉴 재귀 조회
  SELECT
    m.id, m.name, m.path, m.parent_id, m.menu_type, m.order_num,
    m.required_role, m.icon, m.is_active,
    mt.depth + 1,
    mt.sort_path || m.order_num
  FROM menus m
  INNER JOIN menu_tree mt ON m.parent_id = mt.id
  WHERE m.is_active = true
)
SELECT * FROM menu_tree
ORDER BY sort_path;
```

**결과:**
```
id | name         | depth | sort_path
---+--------------+-------+-----------
1  | 대시보드      | 1     | {1}
2  | 관리자        | 1     | {2}
10 | 유저 관리     | 2     | {2,1}
100| 유저 목록     | 3     | {2,1,1}
101| 유저 통계     | 3     | {2,1,2}
11 | 메뉴 관리     | 2     | {2,2}
12 | 프로젝트 관리 | 2     | {2,3}
```

---

## 4. Backend 구현 (Java)

### 4.1 Domain 모델

```java
package com.mapo.palantier.menu.domain;

import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class Menu {
    private Long id;
    private String name;
    private String path;
    private Long parentId;
    private MenuType menuType;
    private Integer orderNum;
    private String requiredRole;  // "USER", "ADMIN", null
    private String icon;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

enum MenuType {
    HEADER, SIDE, SUB
}
```

### 4.2 Repository 인터페이스

```java
package com.mapo.palantier.menu.domain;

import java.util.List;

public interface MenuRepository {
    List<Menu> findAllHeaderMenus(String userRole);
    List<Menu> findChildMenus(Long parentId, String userRole);
    List<Menu> findAllMenuTree(String userRole);
    Menu findById(Long id);
    void save(Menu menu);
    void update(Menu menu);
    void deleteById(Long id);
}
```

### 4.3 MyBatis Mapper

```xml
<!-- MenuMapper.xml -->
<mapper namespace="com.mapo.palantier.menu.infrastructure.MenuMapper">

  <!-- 헤더 메뉴 조회 -->
  <select id="findAllHeaderMenus" resultType="Menu">
    SELECT * FROM menus
    WHERE parent_id IS NULL
      AND is_active = true
      AND (required_role IS NULL OR required_role = #{userRole})
    ORDER BY order_num
  </select>

  <!-- 자식 메뉴 조회 -->
  <select id="findChildMenus" resultType="Menu">
    SELECT * FROM menus
    WHERE parent_id = #{parentId}
      AND is_active = true
      AND (required_role IS NULL OR required_role = #{userRole})
    ORDER BY order_num
  </select>

  <!-- 전체 메뉴 트리 (재귀) -->
  <select id="findAllMenuTree" resultType="Menu">
    WITH RECURSIVE menu_tree AS (
      SELECT * FROM menus
      WHERE parent_id IS NULL AND is_active = true

      UNION ALL

      SELECT m.* FROM menus m
      INNER JOIN menu_tree mt ON m.parent_id = mt.id
      WHERE m.is_active = true
    )
    SELECT * FROM menu_tree
    WHERE required_role IS NULL OR required_role = #{userRole}
    ORDER BY parent_id NULLS FIRST, order_num
  </select>

</mapper>
```

---

## 5. Frontend 구현 (React + TypeScript)

### 5.1 타입 정의

```typescript
// types/menu.ts
export interface Menu {
  id: number
  name: string
  path: string | null
  parentId: number | null
  menuType: 'HEADER' | 'SIDE' | 'SUB'
  orderNum: number
  requiredRole: 'USER' | 'ADMIN' | null
  icon: string | null
  isActive: boolean
  children?: Menu[]  // 계층 구조용
}

export interface MenuTreeResponse {
  headerMenus: Menu[]
}
```

### 5.2 API 호출

```typescript
// entities/menu/api/menuApi.ts
import { api } from '@/shared/api/client'
import type { Menu } from '@/types/menu'

export const menuApi = {
  // 현재 사용자 권한에 맞는 전체 메뉴 트리
  getMenuTree: (): Promise<Menu[]> => {
    return api.get('/api/menus/tree').then(res => res.data)
  },

  // 특정 부모의 자식 메뉴
  getChildMenus: (parentId: number): Promise<Menu[]> => {
    return api.get(`/api/menus/${parentId}/children`).then(res => res.data)
  },
}
```

### 5.3 헤더 컴포넌트

```typescript
// widgets/header/Header.tsx
import { useQuery } from '@tanstack/react-query'
import { menuApi } from '@/entities/menu/api/menuApi'
import { Link } from 'react-router-dom'

export function Header() {
  const { data: menus = [] } = useQuery({
    queryKey: ['menus', 'tree'],
    queryFn: menuApi.getMenuTree,
  })

  // 헤더 메뉴만 필터링
  const headerMenus = menus.filter(m => m.menuType === 'HEADER')

  return (
    <header className="border-b">
      <nav className="flex gap-4 px-4 py-3">
        {headerMenus.map(menu => (
          <Link
            key={menu.id}
            to={menu.path || '#'}
            className="px-3 py-2 hover:bg-gray-100"
          >
            {menu.name}
          </Link>
        ))}
      </nav>
    </header>
  )
}
```

### 5.4 사이드바 컴포넌트

```typescript
// widgets/sidebar/Sidebar.tsx
import { useQuery } from '@tanstack/react-query'
import { menuApi } from '@/entities/menu/api/menuApi'
import { useLocation, Link } from 'react-router-dom'

interface SidebarProps {
  headerMenuId: number  // 현재 선택된 헤더 메뉴 ID
}

export function Sidebar({ headerMenuId }: SidebarProps) {
  const { data: sideMenus = [] } = useQuery({
    queryKey: ['menus', 'children', headerMenuId],
    queryFn: () => menuApi.getChildMenus(headerMenuId),
  })

  const location = useLocation()

  return (
    <aside className="w-64 border-r">
      <nav className="p-4">
        {sideMenus.map(menu => (
          <Link
            key={menu.id}
            to={menu.path || '#'}
            className={`
              block px-4 py-2 rounded mb-1
              ${location.pathname === menu.path ? 'bg-blue-100' : 'hover:bg-gray-100'}
            `}
          >
            {menu.icon && <span className="mr-2">{menu.icon}</span>}
            {menu.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
```

---

## 6. 레이아웃 구조

### 6.1 전체 레이아웃

```typescript
// app/layouts/MainLayout.tsx
import { Header } from '@/widgets/header/Header'
import { Sidebar } from '@/widgets/sidebar/Sidebar'
import { Outlet, useLocation } from 'react-router-dom'
import { useMemo } from 'react'

export function MainLayout() {
  const location = useLocation()

  // 현재 경로에서 헤더 메뉴 ID 추출
  const headerMenuId = useMemo(() => {
    if (location.pathname.startsWith('/admin')) return 2  // 관리자 헤더
    if (location.pathname.startsWith('/dashboard')) return 1  // 대시보드 헤더
    return null
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        {headerMenuId && <Sidebar headerMenuId={headerMenuId} />}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

**화면 구조:**
```
┌─────────────────────────────────────┐
│ Header: [대시보드] [관리자]          │  ← 헤더 메뉴
├──────────┬──────────────────────────┤
│ Sidebar  │ Main Content             │
│          │                          │
│ 유저관리  │  <UsersPage />          │  ← 사이드 메뉴 + 메인
│ 메뉴관리  │                          │
│ 프로젝트  │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

---

## 7. 권한 제어

### 7.1 Backend (Spring Security)

```java
@GetMapping("/api/menus/tree")
public ResponseEntity<List<MenuResponse>> getMenuTree(
    @AuthenticationPrincipal UserDetails userDetails
) {
    String role = userDetails.getAuthorities().stream()
        .findFirst()
        .map(GrantedAuthority::getAuthority)
        .orElse("USER");

    List<Menu> menus = menuService.getMenuTree(role);
    return ResponseEntity.ok(MenuResponse.from(menus));
}
```

### 7.2 Frontend (Route Guard)

```typescript
// app/router.tsx
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/admin',
    element: <ProtectedRoute requiredRole="ADMIN" />,
    children: [
      { path: 'users', element: <UsersPage /> },
      { path: 'menus', element: <MenusPage /> },
    ],
  },
])
```

---

## 8. 장점

### ✅ 단일 테이블의 장점

1. **유연성**: 무한 depth 지원 (헤더 → 사이드 → 서브 → ...)
2. **단순성**: 하나의 테이블만 관리
3. **확장성**: 새로운 메뉴 타입 추가 용이
4. **일관성**: 동일한 CRUD 로직 재사용

### ✅ 계층 구조의 장점

1. **권한 상속**: 부모 메뉴 권한을 자식이 상속 가능
2. **URL 일관성**: `/admin/users/list` 같은 계층적 URL
3. **UI 구성**: 헤더-사이드바-서브메뉴 자연스럽게 표현

---

## 9. 실전 팁

### 메뉴 순서 변경

```sql
-- 순서 변경 (order_num 업데이트)
UPDATE menus SET order_num = 1 WHERE id = 11;  -- 메뉴 관리를 첫 번째로
UPDATE menus SET order_num = 2 WHERE id = 10;  -- 유저 관리를 두 번째로
```

### 메뉴 비활성화 (삭제 대신)

```sql
-- 소프트 삭제
UPDATE menus SET is_active = false WHERE id = 100;
```

### 아이콘 라이브러리

```typescript
// lucide-react 사용 예시
import { Users, Menu, FolderOpen } from 'lucide-react'

const iconMap = {
  Users: <Users />,
  Menu: <Menu />,
  FolderOpen: <FolderOpen />,
}

// 렌더링
{menu.icon && iconMap[menu.icon]}
```

---

## 10. 요약

### 테이블 1개로 충분!

```sql
CREATE TABLE menus (
  id BIGSERIAL PRIMARY KEY,
  parent_id BIGINT REFERENCES menus(id),  -- 이것만으로 계층 구조!
  menu_type VARCHAR(20),
  order_num INT,
  -- ...
);
```

### 구현 패턴

```
1. DB: parent_id로 계층 구조
   ↓
2. Backend: 재귀 쿼리로 트리 조회
   ↓
3. Frontend: 헤더/사이드바 컴포넌트 분리
   ↓
4. 권한: required_role로 필터링
```

**핵심**: 하나의 테이블 + `parent_id` + 재귀 쿼리 = 완벽한 메뉴 시스템!
