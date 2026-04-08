# Security 메뉴 가이드

## 개요

인프라 팀의 **Spring Security / 인증 / 인가** 관련 기술 문서를 정리하는 메뉴.  
백엔드(Core) 페이지와 완전히 동일한 3단 패널 구조(카테고리 → 섹션 → 블록 에디터)로 동작한다.

| 항목 | 값 |
|------|-----|
| 프론트 URL | `/security` |
| 백엔드 API Base | `/api/security-doc` |
| 헤더 메뉴 위치 | 인프라 > Security |
| 접근 권한 | 로그인 필요 (ROLE_USER 이상) |
| 편집 권한 | ROLE_ADMIN 전용 |

---

## DB 테이블

### 테이블 목록

| 테이블 | 설명 |
|--------|------|
| `security_categories` | 카테고리 (1depth) |
| `security_sections`   | 섹션 (2depth, 카테고리 하위) |
| `security_blocks`     | 블록 (3depth, 섹션 하위 실제 콘텐츠) |

### security_categories

```sql
CREATE TABLE security_categories (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    icon       VARCHAR(100),                      -- Lucide 아이콘 이름
    emoji      VARCHAR(10),
    order_num  INTEGER      NOT NULL DEFAULT 0,
    is_active  BOOLEAN      NOT NULL DEFAULT true,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### security_sections

```sql
CREATE TABLE security_sections (
    id          BIGSERIAL    PRIMARY KEY,
    category_id BIGINT       NOT NULL REFERENCES security_categories(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    order_num   INTEGER      NOT NULL DEFAULT 0,
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### security_blocks

```sql
CREATE TABLE security_blocks (
    id         BIGSERIAL   PRIMARY KEY,
    section_id BIGINT      NOT NULL REFERENCES security_sections(id) ON DELETE CASCADE,
    block_type VARCHAR(50) NOT NULL,   -- NOTE / MMD / FIGMA / FILE / DBTABLE / GITHUB
    content    TEXT        NOT NULL DEFAULT '',
    sort_order INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT                 -- users.id 참조
);

CREATE INDEX idx_security_sections_category_id ON security_sections(category_id);
CREATE INDEX idx_security_blocks_section_id    ON security_blocks(section_id);
```

### 실행 이력

| 환경 | 실행일 | 상태 |
|------|--------|------|
| 로컬 Docker | 2025-04-08 | ✅ 완료 |
| EC2 (43.200.241.26) | 2025-04-08 | ✅ 완료 |

> 마이그레이션 히스토리 파일:  
> `src/main/resources/db/migration/V1004__create_security_tables.sql`

---

## 헤더 메뉴 등록

메뉴는 `menus` 테이블에서 관리된다.  
Security 메뉴는 **인프라(parent_id = 49)** 하위에 등록되어 있다.

```sql
-- 이미 실행 완료 (참고용)
INSERT INTO menus (name, path, parent_id, menu_type, order_num, required_role, icon, is_active)
VALUES ('Security', '/security', 49, 'SUB', 4, NULL, 'Shield', true);
```

| 컬럼 | 값 | 설명 |
|------|----|------|
| name | Security | 메뉴 표시명 |
| path | /security | 프론트 라우트 경로 |
| parent_id | 49 | 인프라 메뉴 ID |
| menu_type | SUB | 드롭다운 하위 메뉴 |
| order_num | 4 (로컬) / 99 (EC2) | 관리자 패널에서 드래그로 조정 가능 |
| required_role | NULL | 로그인만 하면 접근 가능 |
| icon | Shield | Lucide 아이콘 |

> EC2의 order_num이 99로 설정되어 있으므로, 원하는 위치가 있다면  
> 관리자 패널(`/admin/menus`)에서 드래그로 순서를 조정하거나 아래 SQL을 실행한다.

```sql
-- EC2에서 순서 조정이 필요한 경우
UPDATE menus SET order_num = 4 WHERE name = 'Security' AND parent_id = 49;
```

---

## 백엔드 구조

```
com.mapo.palantier.security
├── application
│   └── SecurityDocService.java
├── domain
│   ├── SecurityCategory.java
│   ├── SecuritySection.java
│   └── SecurityBlock.java
├── dto
│   ├── SecurityCategoryRequest.java
│   ├── SecuritySectionRequest.java
│   ├── SecurityBlockDto.java
│   └── SecurityReorderRequest.java
├── infrastructure
│   ├── SecurityCategoryMapper.java
│   ├── SecuritySectionMapper.java
│   └── SecurityBlockMapper.java
└── presentation
    └── SecurityDocController.java
```

MyBatis XML:
```
src/main/resources/mybatis/mapper/
├── SecurityCategoryMapper.xml
├── SecuritySectionMapper.xml
└── SecurityBlockMapper.xml
```

### API 엔드포인트

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/api/security-doc/categories` | 로그인 | 카테고리 전체 조회 |
| POST | `/api/security-doc/categories` | ADMIN | 카테고리 생성 |
| PUT | `/api/security-doc/categories/{id}` | ADMIN | 카테고리 수정 |
| DELETE | `/api/security-doc/categories/{id}` | ADMIN | 카테고리 삭제 |
| PUT | `/api/security-doc/categories/reorder` | ADMIN | 카테고리 순서 변경 |
| GET | `/api/security-doc/categories/{id}/sections` | 로그인 | 섹션 목록 조회 |
| POST | `/api/security-doc/sections` | ADMIN | 섹션 생성 |
| PUT | `/api/security-doc/sections/{id}` | ADMIN | 섹션 수정 |
| DELETE | `/api/security-doc/sections/{id}` | ADMIN | 섹션 삭제 |
| PUT | `/api/security-doc/sections/reorder` | ADMIN | 섹션 순서 변경 |
| GET | `/api/security-doc/sections/{id}/blocks` | 로그인 | 블록 목록 조회 |
| PUT | `/api/security-doc/sections/{id}/blocks` | ADMIN | 블록 저장 (전체 교체) |

### ErrorCode

```java
// common/exception/ErrorCode.java 에 추가됨
SECURITY_CATEGORY_NOT_FOUND("SECURITY_CATEGORY_NOT_FOUND", "카테고리를 찾을 수 없습니다", HttpStatus.NOT_FOUND),
SECURITY_SECTION_NOT_FOUND ("SECURITY_SECTION_NOT_FOUND",  "섹션을 찾을 수 없습니다",    HttpStatus.NOT_FOUND),
```

---

## 프론트엔드 구조

```
src/
├── features/security/api/
│   └── securityApi.ts          ← API 클라이언트 (CRUD 전체)
└── pages/security/
    └── SecurityPage.tsx         ← 3단 패널 UI (BackendPage와 동일 구조)
```

라우트 등록 (`src/app/routes/index.tsx`):
```typescript
const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/security",
  beforeLoad: () => requireAuth(),
  component: SecurityPage,
});
```

---

## 카테고리 구성 제안

실제 운영 시 관리자 패널 또는 API로 추가할 카테고리 예시:

| order | 카테고리명 | 아이콘 | 이모지 |
|-------|-----------|--------|--------|
| 1 | Spring Security 기초 | Shield | 🛡️ |
| 2 | 인증 (Authentication) | KeyRound | 🔑 |
| 3 | 인가 (Authorization) | Lock | 🔒 |
| 4 | JWT / 토큰 관리 | Fingerprint | 🎟️ |
| 5 | OAuth2 / 소셜 로그인 | Globe | 🌐 |
| 6 | 보안 설정 & 필터 체인 | Settings | ⚙️ |

SQL로 한 번에 입력하려면:

```sql
INSERT INTO security_categories (name, icon, emoji, order_num) VALUES
  ('Spring Security 기초',  'Shield',      '🛡️', 1),
  ('인증 (Authentication)', 'KeyRound',    '🔑', 2),
  ('인가 (Authorization)',  'Lock',        '🔒', 3),
  ('JWT / 토큰 관리',       'Fingerprint', '🎟️', 4),
  ('OAuth2 / 소셜 로그인',  'Globe',       '🌐', 5),
  ('보안 설정 & 필터 체인', 'Settings',   '⚙️',  6);
```

---

## 새 메뉴 페이지 추가 패턴 (공통 가이드)

Security 페이지는 Core(Backend) 패턴을 그대로 복제한 것이다.  
앞으로 동일 구조의 문서 페이지를 추가할 때는 아래 체크리스트를 따른다.

### 백엔드 체크리스트

- [ ] `com.mapo.palantier.{feature}` 패키지 생성
- [ ] `domain/` — `{Feature}Category`, `{Feature}Section`, `{Feature}Block` 클래스
- [ ] `dto/` — `Request`, `BlockDto`, `ReorderRequest` 클래스
- [ ] `infrastructure/` — `CategoryMapper`, `SectionMapper`, `BlockMapper` 인터페이스
- [ ] `application/` — `{Feature}Service` (CoreService 구조 동일하게)
- [ ] `presentation/` — `{Feature}Controller` (`/api/{feature-slug}` 경로)
- [ ] `mybatis/mapper/` — XML 3개 (테이블명만 변경)
- [ ] `common/exception/ErrorCode.java` — `{FEATURE}_CATEGORY_NOT_FOUND`, `{FEATURE}_SECTION_NOT_FOUND` 추가
- [ ] DB 테이블 3개 생성 (로컬 + EC2 직접 실행)
- [ ] `db/migration/V{번호}__{feature}_tables.sql` 히스토리 파일 작성

### 프론트엔드 체크리스트

- [ ] `src/features/{feature}/api/{feature}Api.ts` — API 클라이언트
- [ ] `src/pages/{feature}/{Feature}Page.tsx` — BackendPage.tsx 복사 후 변경
  - `coreApi` → `{feature}Api`
  - `CoreCategory/Section/Block` 타입 → `{Feature}Category/Section/Block`
  - queryKey `"core"` → `"{feature}"`
  - localStorage key `"core-cat1/2-width"` → `"{feature}-cat1/2-width"`
  - 컴포넌트명 `CorePage` → `{Feature}Page`
  - 헤더 텍스트 / 빈 화면 이모지 변경
- [ ] `src/app/routes/index.tsx` — import + route 정의 + routeTree 추가

### DB & 메뉴 체크리스트

- [ ] 로컬 DB에 SQL 직접 실행
- [ ] EC2 DB에 SQL 직접 실행
- [ ] `menus` 테이블에 헤더 메뉴 INSERT
  ```sql
  -- parent_id: Task=48 / 인프라=49 / Lab=50 / Docu=51 / Subutai=62 / Admin=2
  INSERT INTO menus (name, path, parent_id, menu_type, order_num, required_role, icon, is_active)
  VALUES ('{메뉴명}', '/{path}', {parent_id}, 'SUB', {order_num}, NULL, '{Icon}', true);
  ```
- [ ] 로컬 + EC2 모두 INSERT

### 주요 헤더 메뉴 parent_id 참조표

| 메뉴 그룹 | parent_id (로컬/EC2 공통) |
|-----------|--------------------------|
| Task | 48 |
| 인프라 | 49 |
| Lab | 50 |
| Docu | 51 |
| Subutai | 62 |
| Admin | 2 |

---

## 관련 파일 경로 일람

| 구분 | 경로 |
|------|------|
| 백엔드 서비스 | `parantier-api/src/main/java/com/mapo/palantier/security/application/SecurityDocService.java` |
| 백엔드 컨트롤러 | `parantier-api/src/main/java/com/mapo/palantier/security/presentation/SecurityDocController.java` |
| MyBatis XML (카테고리) | `parantier-api/src/main/resources/mybatis/mapper/SecurityCategoryMapper.xml` |
| MyBatis XML (섹션) | `parantier-api/src/main/resources/mybatis/mapper/SecuritySectionMapper.xml` |
| MyBatis XML (블록) | `parantier-api/src/main/resources/mybatis/mapper/SecurityBlockMapper.xml` |
| DB 마이그레이션 | `parantier-api/src/main/resources/db/migration/V1004__create_security_tables.sql` |
| 프론트 페이지 | `parantier-front/src/pages/security/SecurityPage.tsx` |
| 프론트 API | `parantier-front/src/features/security/api/securityApi.ts` |
| 라우트 설정 | `parantier-front/src/app/routes/index.tsx` |
| 사내 지식관리 문서 | `docs-for-사내지식관리시스템/docs-for-security 관리.md` |