# Security 메뉴 관리 문서

> **위치**: 사내 지식관리 시스템 > 인프라 팀 > Security  
> **최초 작성일**: 2025년  
> **목적**: Spring Security & 인증/인가 관련 팀 내부 지식을 체계적으로 문서화하고 공유하기 위한 메뉴

---

## 목차

1. [개요](#1-개요)
2. [UI/UX 구조](#2-uiux-구조)
3. [카테고리 구성 제안](#3-카테고리-구성-제안)
4. [DB 테이블 구조](#4-db-테이블-구조)
5. [API 엔드포인트](#5-api-엔드포인트)
6. [백엔드 구현 가이드](#6-백엔드-구현-가이드)
7. [프론트엔드 구조](#7-프론트엔드-구조)
8. [Block 타입 상세](#8-block-타입-상세)
9. [권한 모델](#9-권한-모델)
10. [구현 체크리스트](#10-구현-체크리스트)
11. [관련 문서](#11-관련-문서)

---

## 1. 개요

Security 메뉴는 인프라 팀의 **Spring Security & 인증/인가** 관련 지식을 정리하는 전용 문서 공간입니다.

### 핵심 특징

| 항목 | 내용 |
|------|------|
| **URL 경로** | `/security` |
| **백엔드 API Base** | `/api/security-doc` |
| **참조 페이지** | Backend(Core) 페이지 (`/backend`) — 동일한 UI/UX 구조 |
| **접근 권한** | 로그인 사용자 전체 조회 가능, ADMIN만 편집 가능 |
| **DB 네임스페이스** | `security_` 접두사 테이블 3개 사용 |

### 구조 개요 (3-Depth)

```
Security 메뉴
├── Category (카테고리)          ← 좌측 1번 패널
│   ├── Section (섹션)           ← 좌측 2번 패널
│   │   ├── Block (블록)         ← 우측 에디터/뷰어
│   │   ├── Block
│   │   └── Block
│   └── Section
└── Category
```

> **Backend(Core) 페이지와 완전히 동일한 3단 레이아웃**을 사용합니다.  
> 카테고리 → 섹션 → 블록 에디터 순서로 구성되며, ADMIN은 드래그 앤 드롭으로 순서를 변경할 수 있습니다.

---

## 2. UI/UX 구조

### 3단 패널 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│  [Security 문서]                                             │
├──────────────┬──────────────┬──────────────────────────────┤
│  카테고리    │   섹션       │   블록 에디터 / 뷰어          │
│  (패널 1)    │  (패널 2)    │   (패널 3)                   │
│              │              │                              │
│ 🔒 Spring   │ > 기본 개념  │  ┌──────────────────────┐   │
│   Security  │ > 설정 방법  │  │  [NOTE] 리치 텍스트   │   │
│   기초      │ > 실습 예제  │  │  ...                  │   │
│             │              │  └──────────────────────┘   │
│ 🔑 인증     │ > JWT 구조   │  ┌──────────────────────┐   │
│             │ > 토큰 발급  │  │  [CODE] 코드 블록     │   │
│ 🛡 인가     │ > 갱신 전략  │  │  ...                  │   │
│             │              │  └──────────────────────┘   │
│ ...         │ ...          │                              │
└──────────────┴──────────────┴──────────────────────────────┘
```

### 패널 너비 조절

- 패널 1(카테고리)과 패널 2(섹션) 사이에 **드래그 리사이저** 제공
- 패널 2(섹션)와 패널 3(에디터) 사이에 **드래그 리사이저** 제공
- 조절된 너비는 `localStorage`에 저장되어 새로고침 후에도 유지됨
  - `localStorage` 키: `security-cat1-width`, `security-cat2-width`

### ADMIN 전용 기능

- **카테고리 추가/수정/삭제** 버튼 노출
- **섹션 추가/수정/삭제** 버튼 노출
- **드래그 앤 드롭** 으로 카테고리/섹션 순서 변경 (dnd-kit 사용)
- 블록 에디터 **저장/취소** 버튼 노출

---

## 3. 카테고리 구성 제안

> 아래는 운영 시 추가할 카테고리 및 섹션 구성 **제안**입니다.  
> 실제 DB에는 관리자가 직접 추가/수정합니다.

### 카테고리 1: Spring Security 기초

| 섹션 예시 | 설명 |
|-----------|------|
| Spring Security 개요 | Spring Security의 역할, 동작 원리 개요 |
| Security 의존성 추가 | `spring-boot-starter-security` 설정 방법 |
| SecurityFilterChain 기본 | `HttpSecurity` 기본 설정 패턴 |
| CSRF / CORS 설정 | CSRF 비활성화, CORS allowedOrigins 설정 |
| 기본 로그인 페이지 비활성화 | `formLogin().disable()`, `httpBasic().disable()` |

---

### 카테고리 2: 인증 (Authentication)

| 섹션 예시 | 설명 |
|-----------|------|
| Authentication 아키텍처 | `AuthenticationManager`, `AuthenticationProvider` 흐름 |
| UserDetailsService 구현 | `loadUserByUsername()` 커스텀 구현 패턴 |
| UsernamePasswordAuthenticationFilter | 폼 기반 인증 필터 동작 방식 |
| Custom AuthenticationFilter | JWT 기반 커스텀 필터 구현 |
| PasswordEncoder | `BCryptPasswordEncoder` 설정 및 사용법 |

---

### 카테고리 3: 인가 (Authorization)

| 섹션 예시 | 설명 |
|-----------|------|
| Role vs Authority | `ROLE_` 접두사 차이, `GrantedAuthority` 개념 |
| `@PreAuthorize` 사용법 | 메서드 레벨 보안 어노테이션 |
| `@Secured` vs `@PreAuthorize` | 두 어노테이션의 차이점 비교 |
| URL 기반 접근 제어 | `requestMatchers().hasRole()` 패턴 |
| `hasRole` vs `hasAuthority` | 실무에서 헷갈리는 부분 정리 |

---

### 카테고리 4: JWT / 토큰 관리

| 섹션 예시 | 설명 |
|-----------|------|
| JWT 구조 | Header / Payload / Signature 상세 |
| Access Token & Refresh Token | 이중 토큰 전략, 만료 시간 설계 |
| JwtAuthenticationFilter 구현 | `OncePerRequestFilter` 상속 구현 패턴 |
| 토큰 검증 로직 | `JwtUtil` 클래스 구현 및 예외 처리 |
| Refresh Token 갱신 전략 | Redis 기반 Refresh Token 저장 패턴 |
| TokenBlacklist | 로그아웃 시 Access Token 무효화 방법 |

---

### 카테고리 5: OAuth2 / 소셜 로그인

| 섹션 예시 | 설명 |
|-----------|------|
| OAuth2 개념 | Authorization Code Flow 흐름도 |
| Spring Security OAuth2 Client 설정 | `application.yml` 소셜 로그인 설정 |
| `OAuth2UserService` 커스텀 | 소셜 로그인 후 사용자 정보 처리 |
| 카카오 로그인 연동 | 카카오 OAuth2 연동 실전 예제 |
| 구글 로그인 연동 | 구글 OAuth2 연동 실전 예제 |
| `OAuth2AuthenticationSuccessHandler` | 로그인 성공 후 JWT 발급 처리 |

---

### 카테고리 6: 보안 설정 & 필터 체인

| 섹션 예시 | 설명 |
|-----------|------|
| SecurityFilterChain 전체 구성 | 실무 `SecurityConfig` 전체 예제 |
| 필터 순서 (`addFilterBefore` / `addFilterAfter`) | 커스텀 필터 위치 지정 방법 |
| `ExceptionTranslationFilter` | 401 / 403 응답 커스터마이징 |
| `AuthenticationEntryPoint` | 미인증 요청 처리 커스텀 |
| `AccessDeniedHandler` | 권한 없음 응답 커스텀 |
| `SecurityContext` & `SecurityContextHolder` | 인증 정보 저장/조회 방법 |

---

## 4. DB 테이블 구조

> **Backend(Core) 페이지의 `core_*` 테이블과 완전히 동일한 스키마 구조**를 따릅니다.
> 테이블 접두사만 `core_` → `security_` 로 변경합니다.

### 4.1 security_categories

```sql
CREATE TABLE security_categories (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL COMMENT '카테고리 이름 (예: Spring Security 기초)',
    icon       VARCHAR(50)  DEFAULT NULL COMMENT 'Lucide 아이콘 이름 (예: shield)',
    emoji      VARCHAR(10)  DEFAULT NULL COMMENT '이모지 (예: 🔒)',
    order_num  INT          NOT NULL DEFAULT 0 COMMENT '정렬 순서',
    is_active  TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '활성 여부 (0: 비활성, 1: 활성)',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) COMMENT='Security 문서 카테고리';
```

**컬럼 설명**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | BIGINT | PK, Auto Increment |
| `name` | VARCHAR(100) | 카테고리 표시명 |
| `icon` | VARCHAR(50) | Lucide 아이콘 이름 (프론트엔드 렌더링용) |
| `emoji` | VARCHAR(10) | 카테고리 앞에 표시할 이모지 |
| `order_num` | INT | 패널 내 정렬 순서 (낮을수록 위) |
| `is_active` | TINYINT(1) | 비활성 카테고리는 목록에서 제외 |
| `created_at` | DATETIME | 생성 시각 |
| `updated_at` | DATETIME | 최종 수정 시각 |

---

### 4.2 security_sections

```sql
CREATE TABLE security_sections (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    category_id BIGINT       NOT NULL COMMENT 'security_categories.id FK',
    title       VARCHAR(200) NOT NULL COMMENT '섹션 제목',
    order_num   INT          NOT NULL DEFAULT 0 COMMENT '카테고리 내 정렬 순서',
    is_active   TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '활성 여부',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_security_sections_category
        FOREIGN KEY (category_id) REFERENCES security_categories(id)
        ON DELETE CASCADE
) COMMENT='Security 문서 섹션';
```

**컬럼 설명**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | BIGINT | PK, Auto Increment |
| `category_id` | BIGINT | FK → `security_categories.id` |
| `title` | VARCHAR(200) | 섹션 제목 (패널 2에 표시) |
| `order_num` | INT | 같은 카테고리 내 정렬 순서 |
| `is_active` | TINYINT(1) | 비활성 섹션은 목록에서 제외 |
| `created_at` | DATETIME | 생성 시각 |
| `updated_at` | DATETIME | 최종 수정 시각 |

---

### 4.3 security_blocks

```sql
CREATE TABLE security_blocks (
    id         BIGINT   NOT NULL AUTO_INCREMENT,
    section_id BIGINT   NOT NULL COMMENT 'security_sections.id FK',
    block_type VARCHAR(20) NOT NULL COMMENT '블록 타입: NOTE/MMD/FIGMA/FILE/DBTABLE/GITHUB',
    content    LONGTEXT NOT NULL COMMENT '블록 본문 (JSON 또는 plain text)',
    sort_order INT      NOT NULL DEFAULT 0 COMMENT '섹션 내 블록 정렬 순서',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT   DEFAULT NULL COMMENT '마지막 수정자 users.id',
    PRIMARY KEY (id),
    CONSTRAINT fk_security_blocks_section
        FOREIGN KEY (section_id) REFERENCES security_sections(id)
        ON DELETE CASCADE
) COMMENT='Security 문서 블록 (에디터 콘텐츠 단위)';
```

**컬럼 설명**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | BIGINT | PK, Auto Increment |
| `section_id` | BIGINT | FK → `security_sections.id` |
| `block_type` | VARCHAR(20) | 블록 종류 (`NOTE`, `MMD`, `FIGMA`, `FILE`, `DBTABLE`, `GITHUB`) |
| `content` | LONGTEXT | 블록 내용 (NOTE는 Lexical JSON, MMD는 Mermaid 문자열 등) |
| `sort_order` | INT | 섹션 내 블록 출력 순서 |
| `created_at` | DATETIME | 생성 시각 |
| `updated_at` | DATETIME | 최종 수정 시각 (블록 저장 시 전체 교체 방식으로 갱신) |
| `updated_by` | BIGINT | 마지막 저장한 사용자 ID (FK → `users.id`, nullable) |

### 4.4 블록 저장 전략 (Delete & Re-Insert)

```
섹션 블록 저장 시:
  1. 해당 section_id의 기존 블록 전체 DELETE
  2. 새 블록 목록을 sort_order 0부터 순서대로 INSERT
```

> Core 페이지와 동일한 **전체 교체(replace-all)** 방식을 사용합니다.  
> 이 방식은 구현이 단순하고 순서 관리가 명확한 장점이 있습니다.

---

## 5. API 엔드포인트

**Base URL**: `/api/security-doc`  
**인증**: 모든 엔드포인트는 `Authorization: Bearer {accessToken}` 헤더 필요  
**관리**: `[ADMIN]` 표시 엔드포인트는 `ROLE_ADMIN` 필요 (`@PreAuthorize("hasRole('ADMIN')")`)

---

### 5.1 Category API

| Method | Endpoint | 권한 | 설명 |
|--------|----------|------|------|
| `GET` | `/api/security-doc/categories` | 인증 유저 | 활성 카테고리 목록 조회 (`is_active=true`, `order_num` 오름차순) |
| `POST` | `/api/security-doc/categories` | `[ADMIN]` | 카테고리 생성 |
| `PUT` | `/api/security-doc/categories/{id}` | `[ADMIN]` | 카테고리 수정 (이름, 아이콘, 이모지) |
| `DELETE` | `/api/security-doc/categories/{id}` | `[ADMIN]` | 카테고리 삭제 (하위 섹션/블록 CASCADE) |
| `PUT` | `/api/security-doc/categories/reorder` | `[ADMIN]` | 카테고리 순서 일괄 변경 |

#### POST /api/security-doc/categories — Request Body

```json
{
  "name": "JWT / 토큰 관리",
  "icon": "key",
  "emoji": "🔑",
  "orderNum": 4
}
```

#### PUT /api/security-doc/categories/reorder — Request Body

```json
[
  { "id": 1, "orderNum": 0 },
  { "id": 3, "orderNum": 1 },
  { "id": 2, "orderNum": 2 }
]
```

---

### 5.2 Section API

| Method | Endpoint | 권한 | 설명 |
|--------|----------|------|------|
| `GET` | `/api/security-doc/categories/{id}/sections` | 인증 유저 | 카테고리 하위 활성 섹션 목록 조회 |
| `POST` | `/api/security-doc/sections` | `[ADMIN]` | 섹션 생성 |
| `PUT` | `/api/security-doc/sections/{id}` | `[ADMIN]` | 섹션 수정 (제목, 순서) |
| `DELETE` | `/api/security-doc/sections/{id}` | `[ADMIN]` | 섹션 삭제 (하위 블록 CASCADE) |
| `PUT` | `/api/security-doc/sections/reorder` | `[ADMIN]` | 섹션 순서 일괄 변경 |

#### POST /api/security-doc/sections — Request Body

```json
{
  "categoryId": 4,
  "title": "JWT 구조",
  "orderNum": 0
}
```

---

### 5.3 Block API

| Method | Endpoint | 권한 | 설명 |
|--------|----------|------|------|
| `GET` | `/api/security-doc/sections/{id}/blocks` | 인증 유저 | 섹션 내 블록 목록 조회 (`sort_order` 오름차순) |
| `PUT` | `/api/security-doc/sections/{id}/blocks` | `[ADMIN]` | 섹션 블록 전체 저장 (기존 블록 삭제 후 재삽입) |

#### PUT /api/security-doc/sections/{id}/blocks — Request Body

```json
[
  {
    "blockType": "NOTE",
    "content": "{\"root\":{\"children\":[...]}}"
  },
  {
    "blockType": "MMD",
    "content": "sequenceDiagram\n    Client->>Filter: Request\n    Filter->>JwtUtil: validateToken()\n    JwtUtil-->>Filter: true\n    Filter->>Controller: pass"
  }
]
```

---

### 5.4 전체 엔드포인트 요약

```
# Category
GET    /api/security-doc/categories
POST   /api/security-doc/categories             [ADMIN]
PUT    /api/security-doc/categories/{id}        [ADMIN]
DELETE /api/security-doc/categories/{id}        [ADMIN]
PUT    /api/security-doc/categories/reorder     [ADMIN]

# Section
GET    /api/security-doc/categories/{id}/sections
POST   /api/security-doc/sections               [ADMIN]
PUT    /api/security-doc/sections/{id}          [ADMIN]
DELETE /api/security-doc/sections/{id}          [ADMIN]
PUT    /api/security-doc/sections/reorder       [ADMIN]

# Block
GET    /api/security-doc/sections/{id}/blocks
PUT    /api/security-doc/sections/{id}/blocks   [ADMIN]
```

---

## 6. 백엔드 구현 가이드

> Core 페이지(`/api/core`) 구현을 그대로 복사하여 네임스페이스만 변경하면 됩니다.

### 6.1 패키지 구조

```
com.mapo.palantier.security (또는 securitydoc)
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
│   ├── SecurityCategoryMapper.java    ← MyBatis @Mapper
│   ├── SecuritySectionMapper.java
│   └── SecurityBlockMapper.java
└── presentation
    └── SecurityDocController.java
```

### 6.2 Controller 핵심 구조

```java
@Tag(name = "SecurityDoc", description = "Security 문서 관리 API")
@RestController
@RequestMapping("/api/security-doc")
@RequiredArgsConstructor
public class SecurityDocController {

    private final SecurityDocService securityDocService;

    @GetMapping("/categories")
    public ResponseEntity<List<SecurityCategory>> getCategories() {
        return ResponseEntity.ok(securityDocService.getCategories());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(@RequestBody SecurityCategoryRequest req) {
        securityDocService.createCategory(req);
        return ResponseEntity.ok().build();
    }

    // ... (Core 패턴과 동일)

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}/blocks")
    public ResponseEntity<Void> saveBlocks(
        @PathVariable Long id,
        @RequestBody List<SecurityBlockDto> blocks,
        @AuthenticationPrincipal User user
    ) {
        Long userId = (user != null) ? user.getId() : null;
        securityDocService.saveBlocks(id, blocks, userId);
        return ResponseEntity.ok().build();
    }
}
```

### 6.3 MyBatis XML 매퍼 작성 포인트

- `CoreCategoryMapper.xml` → `SecurityCategoryMapper.xml` 복사
- `namespace` 변경: `com.mapo.palantier.securitydoc.infrastructure.SecurityCategoryMapper`
- 테이블명 변경: `core_categories` → `security_categories`
- `resultMap` type 변경: `...core.domain.CoreCategory` → `...securitydoc.domain.SecurityCategory`
- 섹션/블록 XML도 동일하게 처리

### 6.4 Service 핵심 로직 — 블록 저장

```java
@Transactional
public void saveBlocks(Long sectionId, List<SecurityBlockDto> blocks, Long userId) {
    // 1. 기존 블록 전체 삭제
    blockMapper.deleteBySectionId(sectionId);

    if (blocks == null || blocks.isEmpty()) return;

    // 2. 새 블록 순서대로 삽입
    for (int i = 0; i < blocks.size(); i++) {
        SecurityBlockDto dto = blocks.get(i);
        SecurityBlock block = SecurityBlock.builder()
            .sectionId(sectionId)
            .blockType(dto.getBlockType())
            .content(dto.getContent())
            .sortOrder(i)
            .updatedBy(userId)
            .build();
        blockMapper.insert(block);
    }
}
```

### 6.5 에러 코드 등록

`ErrorCode` enum에 Security 관련 에러 코드를 추가해야 합니다.

```java
// ErrorCode.java에 추가
SECURITY_CATEGORY_NOT_FOUND("SECURITY_001", "Security 카테고리를 찾을 수 없습니다."),
SECURITY_SECTION_NOT_FOUND("SECURITY_002", "Security 섹션을 찾을 수 없습니다."),
```

---

## 7. 프론트엔드 구조

### 7.1 파일 구조

```
src/
├── pages/
│   └── security/
│       └── SecurityPage.tsx          ← 메인 페이지 컴포넌트
│
├── features/
│   └── security/
│       └── api/
│           └── securityApi.ts        ← API 호출 함수 모음
│
└── app/routes/
    └── index.tsx                     ← 라우트 등록 필요
```

### 7.2 securityApi.ts 구현 예시

```typescript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BASE = API_BASE.endsWith("/api") ? API_BASE : API_BASE + "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
});

export interface SecurityCategory {
  id: number;
  name: string;
  icon: string;
  emoji: string;
  orderNum: number;
}

export interface SecuritySection {
  id: number;
  categoryId: number;
  title: string;
  orderNum: number;
}

export interface SecurityBlock {
  id?: number;
  sectionId?: number;
  blockType: string;
  content: string;
  sortOrder?: number;
}

export const securityApi = {
  getCategories: (): Promise<SecurityCategory[]> =>
    fetch(`${BASE}/security-doc/categories`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  getSections: (categoryId: number): Promise<SecuritySection[]> =>
    fetch(`${BASE}/security-doc/categories/${categoryId}/sections`, {
      headers: getAuthHeaders(),
    })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  getBlocks: (sectionId: number): Promise<SecurityBlock[]> =>
    fetch(`${BASE}/security-doc/sections/${sectionId}/blocks`, {
      headers: getAuthHeaders(),
    })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  saveBlocks: (sectionId: number, blocks: SecurityBlock[]): Promise<void> =>
    fetch(`${BASE}/security-doc/sections/${sectionId}/blocks`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(blocks),
    }).then((r) => {
      if (!r.ok) throw new Error("저장 실패");
    }),

  createCategory: (data: {
    name: string; icon: string; emoji: string; orderNum: number;
  }): Promise<void> =>
    fetch(`${BASE}/security-doc/categories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => { if (!r.ok) throw new Error(); }),

  updateCategory: (id: number, data: {
    name: string; icon: string; emoji: string; orderNum: number;
  }): Promise<void> =>
    fetch(`${BASE}/security-doc/categories/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => { if (!r.ok) throw new Error(); }),

  deleteCategory: (id: number): Promise<void> =>
    fetch(`${BASE}/security-doc/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => { if (!r.ok) throw new Error(); }),

  createSection: (data: {
    categoryId: number; title: string; orderNum: number;
  }): Promise<void> =>
    fetch(`${BASE}/security-doc/sections`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => { if (!r.ok) throw new Error(); }),

  updateSection: (id: number, data: {
    title: string; orderNum: number;
  }): Promise<void> =>
    fetch(`${BASE}/security-doc/sections/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => { if (!r.ok) throw new Error(); }),

  deleteSection: (id: number): Promise<void> =>
    fetch(`${BASE}/security-doc/sections/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => { if (!r.ok) throw new Error(); }),

  reorderCategories: (items: { id: number; orderNum: number }[]): Promise<void> =>
    fetch(`${BASE}/security-doc/categories/reorder`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(items),
    }).then((r) => { if (!r.ok) throw new Error(); }),

  reorderSections: (items: { id: number; orderNum: number }[]): Promise<void> =>
    fetch(`${BASE}/security-doc/sections/reorder`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(items),
    }).then((r) => { if (!r.ok) throw new Error(); }),
};
```

### 7.3 라우트 등록 (`src/app/routes/index.tsx`)

```typescript
// 1. import 추가
import SecurityPage from "@/pages/security/SecurityPage";

// 2. Route 생성
const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/security",
  beforeLoad: () => requireAuth(),
  component: SecurityPage,
});

// 3. routeTree에 추가
const routeTree = rootRoute.addChildren([
  // ... 기존 routes
  securityRoute,
  notFoundRoute,
]);
```

### 7.4 SecurityPage.tsx 구현 전략

> `BackendPage.tsx` (= `CorePage`)를 복사하여 다음 항목만 변경합니다.

| 변경 전 (BackendPage) | 변경 후 (SecurityPage) |
|----------------------|----------------------|
| `coreApi` import | `securityApi` import |
| `CoreCategory`, `CoreSection`, `CoreBlock` 타입 | `SecurityCategory`, `SecuritySection`, `SecurityBlock` 타입 |
| `core` queryKey | `security` queryKey |
| `security-cat1-width` localStorage 키 | `security-cat1-width` (이미 적합) |
| 페이지 타이틀 텍스트 | `"Security 문서"` |

---

## 8. Block 타입 상세

Security 문서에서 활용할 수 있는 블록 타입 목록입니다.

| block_type | 설명 | Security 활용 예시 |
|------------|------|-------------------|
| `NOTE` | Lexical 리치 텍스트 에디터 | 개념 설명, 주의사항, 실무 팁 |
| `MMD` | Mermaid 다이어그램 | 인증 흐름도, SecurityFilterChain 시퀀스 다이어그램 |
| `FIGMA` | Figma iframe 임베드 | 보안 아키텍처 시각화 |
| `FILE` | 파일 링크/첨부 | 보안 설정 파일, 참고 PDF |
| `DBTABLE` | DB 테이블 스키마 뷰어 | `users`, `refresh_tokens` 테이블 구조 |
| `GITHUB` | GitHub 링크/코드 참조 | 실제 구현 코드 링크 |

### MMD 블록 활용 예시 — JWT 인증 흐름

```
sequenceDiagram
    participant C as Client
    participant F as JwtAuthFilter
    participant J as JwtUtil
    participant SC as SecurityContext
    participant API as Controller

    C->>F: HTTP Request (Authorization: Bearer token)
    F->>J: validateToken(token)
    alt 유효한 토큰
        J-->>F: true + Claims
        F->>SC: SecurityContextHolder.set(Authentication)
        F->>API: doFilterInternal() 통과
        API-->>C: 200 OK
    else 만료/위조 토큰
        J-->>F: JwtException
        F-->>C: 401 Unauthorized
    end
```

### MMD 블록 활용 예시 — SecurityFilterChain 순서

```
flowchart LR
    A[Request] --> B[CorsFilter]
    B --> C[JwtAuthFilter]
    C --> D[UsernamePassword\nAuthFilter]
    D --> E[ExceptionTranslation\nFilter]
    E --> F[FilterSecurityInterceptor]
    F --> G[Controller]
```

---

## 9. 권한 모델

### 9.1 페이지 접근 권한

| 대상 | 권한 | 설명 |
|------|------|------|
| 비로그인 사용자 | 접근 불가 | `/security` 라우트에 `requireAuth()` 적용 |
| 일반 로그인 사용자 | 읽기 전용 | 카테고리/섹션/블록 조회만 가능 |
| ADMIN (`ROLE_ADMIN`) | 읽기 + 쓰기 | 카테고리/섹션 생성·수정·삭제, 블록 저장 가능 |

### 9.2 백엔드 API 권한 체크

```java
// 조회 API - Spring Security 전역 설정에서 인증된 사용자만 접근 허용
@GetMapping("/categories")
public ResponseEntity<List<SecurityCategory>> getCategories() { ... }

// 관리 API - 메서드 레벨 @PreAuthorize로 ADMIN 체크
@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/categories")
public ResponseEntity<Void> createCategory(...) { ... }
```

### 9.3 프론트엔드 ADMIN 기능 노출 조건

```typescript
// SecurityPage.tsx 내부
const user = useStore(authStore, (s) => s.user);
const isAdmin = user?.role === "ROLE_ADMIN";

// ADMIN인 경우에만 편집 버튼 렌더링
{isAdmin && (
  <Button onClick={handleEdit}>
    <Pencil size={14} /> 편집
  </Button>
)}
```

---

## 10. 구현 체크리스트

### 백엔드

- [ ] DB 테이블 생성 (`security_categories`, `security_sections`, `security_blocks`)
- [ ] Domain 클래스 작성 (`SecurityCategory`, `SecuritySection`, `SecurityBlock`)
- [ ] DTO 클래스 작성 (`SecurityCategoryRequest`, `SecuritySectionRequest`, `SecurityBlockDto`, `SecurityReorderRequest`)
- [ ] MyBatis Mapper 인터페이스 작성 (3개)
- [ ] MyBatis XML 매퍼 작성 (3개, `resources/mybatis/mapper/` 경로)
- [ ] `SecurityDocService.java` 작성
- [ ] `SecurityDocController.java` 작성 (`/api/security-doc` 매핑)
- [ ] `ErrorCode` enum에 `SECURITY_CATEGORY_NOT_FOUND`, `SECURITY_SECTION_NOT_FOUND` 추가
- [ ] Swagger 태그 정상 노출 확인

### 프론트엔드

- [ ] `src/features/security/api/securityApi.ts` 작성
- [ ] `src/pages/security/SecurityPage.tsx` 작성 (BackendPage 기반)
- [ ] `src/app/routes/index.tsx`에 `/security` 라우트 등록
- [ ] `Header` 또는 사이드 메뉴에 "Security" 메뉴 항목 추가 (관리자 메뉴 설정에서 처리)
- [ ] `localStorage` 키 충돌 여부 확인 (`security-cat1-width`, `security-cat2-width`)
- [ ] React Query `queryKey` 네임스페이스 확인 (`["security", ...]`)

### 검증

- [ ] 카테고리 CRUD 동작 확인
- [ ] 섹션 CRUD 동작 확인
- [ ] 드래그 앤 드롭 순서 변경 후 새로고침 시 순서 유지 확인
- [ ] 블록 저장 후 재조회 시 내용 유지 확인
- [ ] ADMIN 아닌 사용자가 편집 API 직접 호출 시 403 응답 확인
- [ ] `category` 삭제 시 하위 `section`, `block` CASCADE 삭제 확인

---

## 11. 관련 문서

| 문서 | 경로 | 설명 |
|------|------|------|
| Backend(Core) 페이지 | `/backend` | Security 메뉴와 동일한 UI/UX 구조의 참조 페이지 |
| BackendPage 소스 | `src/pages/backend/BackendPage.tsx` | 복사 기반 구현 시 참조 |
| backendApi.ts 소스 | `src/features/backend/api/backendApi.ts` | API 함수 패턴 참조 |
| CoreController.java | `parantier-api/.../core/presentation/CoreController.java` | 컨트롤러 패턴 참조 |
| CoreService.java | `parantier-api/.../core/application/CoreService.java` | 서비스 로직 패턴 참조 |
| CoreCategoryMapper.xml | `resources/mybatis/mapper/CoreCategoryMapper.xml` | XML 매퍼 패턴 참조 |
| Architecture 페이지 | `/architecture` | 유사 구조 참조 |
| Frontend 페이지 | `/frontend` | 유사 구조 참조 |

---

> **참고**: Security 메뉴는 Backend(Core) 페이지 구현 패턴을 그대로 따릅니다.  
> 신규 구현 시 `core` 관련 파일들을 복사한 뒤 클래스명·테이블명·API 경로만 변경하면  
> 최소한의 작업으로 동일한 UX를 제공하는 문서 메뉴를 완성할 수 있습니다.