# Palantier Frontend

React + TypeScript + Vite 기반 프로젝트 관리 플랫폼 프론트엔드

## 기술 스택

- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **TanStack Router** (파일 기반 라우팅)
- **TanStack Query** (서버 상태 관리)
- **React Hook Form** + **Zod** (폼 & 유효성 검사)
- **AG Grid** (데이터 그리드)
- **Tailwind CSS** + **shadcn/ui** (스타일)
- **STOMP / WebSocket** (실시간 채팅)

## 로컬 실행

```bash
cd parantier-front
npm install
npm run dev
```

> 기본 포트: http://localhost:5173

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_API_URL` | 백엔드 REST API URL | `http://localhost:8080/api` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:8080/ws` |

로컬 개발 시 `.env.local` 파일 생성:

```bash
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

## 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

## 배포

GitHub Actions를 통해 `main` 브랜치에 push 시 자동 배포됩니다.

- **S3 버킷**: `dxline-tallent-front`
- **CloudFront**: `https://dxline-tallent.com`

수동 배포가 필요한 경우 GitHub Actions 탭 → `Deploy Frontend to S3 and CloudFront` → `Run workflow`

## 프로젝트 구조

```
src/
├── components/       # 공통 컴포넌트
├── pages/            # 페이지 컴포넌트
├── routes/           # TanStack Router 라우트
├── hooks/            # 커스텀 훅
├── api/              # API 호출 함수
├── types/            # TypeScript 타입 정의
└── lib/              # 유틸리티
```
