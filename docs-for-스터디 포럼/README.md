# 스터디 기능 구현 문서

## 📚 문서 구조

### 📁 구현 계획/
체계적인 구현을 위한 단계별 설계 문서

- **1_프로젝트_개요.md**: 프로젝트 목적, 핵심 기능, 구현 단계
- **2_백엔드_API_설계.md**: RESTful API 엔드포인트, 권한 체계, MyBatis Mapper
- **3_프론트엔드_컴포넌트_설계.md**: React 컴포넌트 구조, 데이터 페칭, UI 라이브러리

### 📁 테이블 설계/
PostgreSQL 데이터베이스 스키마 정의

- **study_categories.sql**: 카테고리 계층 구조 테이블 + 샘플 데이터
- **study_posts.sql**: 스터디 포스트 테이블, 댓글 테이블, 첨부파일 테이블

### 📁 uiux 흐름 mmd/
Mermaid 다이어그램으로 UI/UX 흐름 시각화

- **스터디_UI_흐름.mmd**: 사용자 인터랙션 플로우
- **3단_레이아웃_상세.mmd**: 좌측/중앙/우측 레이아웃 구조

---

## 🎯 핵심 컨셉

### 목적
팀원들이 기술 지식을 카테고리별로 체계적으로 정리하고 공유하는 **스터디 공간** 구현

### 특징
- 계층적 카테고리 트리로 주제 분류
- 3단 레이아웃으로 직관적인 탐색
- Lexical 에디터로 리치 텍스트 작성
- 공개/비공개 설정으로 접근 제어

---

## 🏗️ 아키텍처

### 3단 레이아웃
```
┌──────────────┬───────────────────┬─────────────────────────┐
│  좌측 (240px)│  중앙 (flex 40%)  │  우측 (flex 60%)        │
├──────────────┼───────────────────┼─────────────────────────┤
│ 카테고리 트리│  포스트 목록       │  포스트 본문 & 에디터    │
│              │                   │                         │
│ 🧱 Core      │ 📄 React 훅 정리  │ # React 훅 정리         │
│   Frontend   │ 📄 MyBatis 설정   │                         │
│   Backend    │ 📄 Docker 기초    │ ## useState             │
│              │                   │ ...                     │
│ ☁️ Infra     │ + 새 포스트 추가  │ [저장] [취소]            │
└──────────────┴───────────────────┴─────────────────────────┘
```

### 계층 구조
```
대분류 (Level 1)
└─ 중분류 (Level 2)
   └─ 소분류 (Level 3, 선택)
      └─ 포스트 (제목, 본문, 첨부파일)
```

---

## 🔑 네이밍 규칙

| 구분 | 네이밍 |
|------|--------|
| 헤더 메뉴 | `스터디` |
| 라우트 경로 | `/study` |
| 백엔드 패키지 | `com.mapo.palantier.study` |
| API 경로 | `/api/study/...` |
| DB 테이블 | `study_categories`, `study_posts`, `study_comments`, `study_attachments` |
| 프론트 페이지 | `src/pages/study/StudyPage.tsx` |
| 프론트 피처 | `src/features/study/` |

---

## 🚀 빠른 시작

### 1. 데이터베이스 준비
```bash
# 로컬 Docker DB 접속
docker exec -it palantier-postgres psql -U palantier_user -d palantier

# 테이블 생성
\i docs-for-스터디\ 포럼/테이블\ 설계/study_categories.sql
\i docs-for-스터디\ 포럼/테이블\ 설계/study_posts.sql
```

### 2. 백엔드 구현
1. `parantier-api/src/main/java/com/mapo/palantier/study/` 패키지 생성
2. domain, repository, service, controller 구현
3. MyBatis Mapper XML 작성 (`resources/mappers/study/`)

### 3. 프론트엔드 구현
1. `parantier-front/src/pages/study/StudyPage.tsx` 생성
2. `parantier-front/src/features/study/` 컴포넌트 구현
3. TanStack Query hooks 작성
4. 라우트 등록 (`src/app/routes/index.tsx`)

### 4. DB 메뉴 등록
```sql
-- 헤더 메뉴 추가
INSERT INTO menus (name, path, parent_id, menu_type, order_num)
VALUES ('스터디', '/study', NULL, 'HEADER', 7);
```

---

## 📝 구현 체크리스트

### Phase 1: DB & 백엔드 기본 구조
- [ ] `study_categories` 테이블 생성
- [ ] `study_posts` 테이블 생성
- [ ] `study_comments` 테이블 생성
- [ ] `study_attachments` 테이블 생성
- [ ] `StudyCategoryMapper` 구현 (재귀 CTE 쿼리)
- [ ] `StudyPostMapper` 구현 (CRUD)
- [ ] `StudyCategoryController` API 구현
- [ ] `StudyPostController` API 구현

### Phase 2: 프론트엔드 기본 구조
- [ ] `StudyPage` 3단 레이아웃 구현
- [ ] `CategorySidebar` 컴포넌트
- [ ] `StudyPostList` 컴포넌트
- [ ] `StudyPostViewer` 컴포넌트 (읽기 모드)
- [ ] `useStudyCategoryTree` hook
- [ ] `useStudyPosts` hook
- [ ] `useStudyPost` hook
- [ ] 라우트 등록 (`/study`)
- [ ] DB 헤더 메뉴 등록

### Phase 3: 편집 기능
- [ ] `StudyPostEditor` 편집 모드 (Lexical 에디터 재사용)
- [ ] `useCreateStudyPost`, `useUpdateStudyPost`, `useDeleteStudyPost` hooks
- [ ] 이미지 첨부 (S3)

### Phase 4: 고급 기능
- [ ] 댓글 기능 (`study_comments`)
- [ ] 검색 기능 (제목 + 본문 전체 텍스트)
- [ ] 카테고리 관리 (관리자)
- [ ] 상단 고정 기능 (`is_pinned`)

### Phase 5: 최적화 & 배포
- [ ] 성능 최적화
- [ ] 반응형 디자인
- [ ] EC2 DB 메뉴 등록
- [ ] 프론트 배포

---

## ♻️ 재사용 가능한 기존 구현

| 기능 | 참고 파일 |
|------|-----------|
| Lexical 리치 에디터 | `src/shared/ui/lexical/LexicalEditor.tsx` |
| Lexical 뷰어 | `src/shared/ui/lexical/LexicalViewer.tsx` |
| 3단 레이아웃 | `src/pages/issues/IssuesPage.tsx` |
| 계층 트리 구조 | `src/features/task/components/TasksPage.tsx` |
| 이미지 S3 업로드 | `src/features/issue/` |
| 공통 확인 다이얼로그 | `src/shared/hooks/useConfirm.tsx` |

---

## 📧 참고

- 백엔드 API 상세: `구현 계획/2_백엔드_API_설계.md`
- 프론트 컴포넌트 상세: `구현 계획/3_프론트엔드_컴포넌트_설계.md`
- UI 흐름: `uiux 흐름 mmd/`

---

**작성일**: 2026-03-28
**버전**: 2.0 (스터디로 전면 개편)