# 노트 관리 기능 구현 문서

## 📚 문서 구조

### 📁 구현 계획/
체계적인 구현을 위한 단계별 설계 문서

- **1_프로젝트_개요.md**: 프로젝트 목적, 핵심 기능, 구현 단계
- **2_백엔드_API_설계.md**: RESTful API 엔드포인트, 권한 체계, MyBatis Mapper
- **3_프론트엔드_컴포넌트_설계.md**: React 컴포넌트 구조, 데이터 페칭, UI 라이브러리

### 📁 테이블 설계/
PostgreSQL 데이터베이스 스키마 정의

- **note_categories.sql**: 카테고리 계층 구조 테이블 + 샘플 데이터
- **notes.sql**: 노트 본문 테이블, 첨부파일 테이블, 버전 히스토리 테이블

### 📁 uiux 흐름 mmd/
Mermaid 다이어그램으로 UI/UX 흐름 시각화

- **노트_관리_UI_흐름.mmd**: 사용자 인터랙션 플로우
- **3단_레이아웃_상세.mmd**: 좌측/중앙/우측 레이아웃 구조

---

## 🎯 핵심 컨셉

### 문제점
❌ 기존: 각 주제별로 별도 메뉴 생성 (Frontend Note, Backend Note, ...)
- 메뉴가 너무 많아짐
- 계층 관리 어려움
- 확장성 부족

### 해결책
✅ 개선: 단일 "노트 관리" 페이지 내에서 모든 노트를 계층적으로 관리
- 카테고리 트리로 체계적 분류
- 3단 레이아웃으로 직관적인 탐색
- 확장 가능한 구조

---

## 🏗️ 아키텍처

### 3단 레이아웃
```
┌──────────────┬───────────────────┬─────────────────────────┐
│  좌측 (240px)│  중앙 (flex 40%)  │  우측 (flex 60%)        │
├──────────────┼───────────────────┼─────────────────────────┤
│ 카테고리 트리│  노트 주제 목록    │  노트 본문 & 에디터      │
│              │                   │                         │
│ 🧱 Core      │ 📄 React 19 기능  │ # React 19 주요 업데이트│
│   Frontend   │ 📄 TanStack Query │                         │
│   Backend    │ 📄 shadcn/ui 커스텀│ ## 1. Server Components │
│              │                   │ - RSC 안정화            │
│ 🎨 Client/UX │ + 새 노트 추가    │ - 서버 사이드 렌더링... │
│   Design     │                   │                         │
│              │                   │ [저장] [취소]            │
└──────────────┴───────────────────┴─────────────────────────┘
```

### 계층 구조
```
대분류 (Level 1)
└─ 중분류 (Level 2)
   └─ 소분류 (Level 3, 선택)
      └─ 노트 (제목, 본문, 첨부파일)
```

---

## 🚀 빠른 시작

### 1. 데이터베이스 준비
```bash
# PostgreSQL에 접속
docker exec -it palantier-postgres psql -U palantier_user -d palantier

# 테이블 생성
\i docs-for-노트\ 관리\ 기능\ 구현/테이블\ 설계/note_categories.sql
\i docs-for-노트\ 관리\ 기능\ 구현/테이블\ 설계/notes.sql
```

### 2. 백엔드 구현
1. `parantier-api/src/main/java/com/mapo/palantier/note/` 패키지 생성
2. domain, repository, service, controller 구현
3. MyBatis Mapper XML 작성

### 3. 프론트엔드 구현
1. `parantier-front/src/pages/notes/NotesPage.tsx` 생성
2. `parantier-front/src/features/note/` 컴포넌트 구현
3. TanStack Query hooks 작성

### 4. Markdown 라이브러리 설치
```bash
cd parantier-front
npm install react-markdown react-syntax-highlighter remark-gfm
npm install -D @types/react-syntax-highlighter
```

---

## 📝 구현 체크리스트

### Phase 1: 데이터베이스 & 백엔드 기본 구조
- [ ] note_categories 테이블 생성
- [ ] notes 테이블 생성
- [ ] note_attachments 테이블 생성
- [ ] NoteCategoryMapper 구현 (재귀 쿼리)
- [ ] NoteMapper 구현 (CRUD)
- [ ] NoteCategoryController API 구현
- [ ] NoteController API 구현

### Phase 2: 프론트엔드 기본 구조
- [ ] NotesPage 3단 레이아웃 구현
- [ ] CategorySidebar 컴포넌트
- [ ] NoteList 컴포넌트
- [ ] NoteEditor 컴포넌트 (읽기 모드)
- [ ] useNoteCategoryTree hook
- [ ] useNotes hook
- [ ] useNote hook

### Phase 3: 편집 기능
- [ ] NoteEditor 편집 모드
- [ ] Markdown 에디터 통합
- [ ] 코드 블록 syntax highlighting
- [ ] useCreateNote, useUpdateNote, useDeleteNote hooks

### Phase 4: 고급 기능
- [ ] 이미지 첨부 (드래그앤드롭 + S3)
- [ ] 검색 기능 (전체 텍스트)
- [ ] 태그 필터링
- [ ] 조회수 트래킹
- [ ] 상단 고정 기능

### Phase 5: 최적화 & 배포
- [ ] 성능 최적화 (쿼리, 렌더링)
- [ ] 반응형 디자인
- [ ] 통합 테스트
- [ ] 배포

---

## 🎨 UI/UX Mermaid 다이어그램

### 플로우 확인
```bash
# Mermaid 다이어그램 렌더링
# VS Code: Mermaid Preview 확장 사용
# 또는 https://mermaid.live 에서 확인
```

---

## 📚 참고 자료

### 기술 문서
- [React Markdown](https://github.com/remarkjs/react-markdown)
- [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)

### 프로젝트 내부
- `/parantier-front/src/pages/issues/IssuesPage.tsx`: 3단 레이아웃 참고
- `/parantier-api/src/main/java/com/mapo/palantier/menu/`: 계층 구조 참고

---

## 📧 문의

구현 중 질문이나 제안 사항이 있으면 이슈를 등록하거나 팀원에게 문의하세요.

---

**작성일**: 2026-03-28
**작성자**: Claude & 사용자
**버전**: 1.0
