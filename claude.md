# Palantier 프로젝트

## 프로젝트 개요

사내 개발팀을 위한 올인원 협업 플랫폼.
- **Backend**: Spring Boot 4 / MyBatis / PostgreSQL (`parantier-api/`)
- **Frontend**: React + TypeScript / TanStack Router (`parantier-front/`)

---

## ⚠️ 절대 규칙 (항상 적용)

1. **서버 시작/중지 금지** — `bootRun`, `npm run dev`, `kill`, `nohup` 등 절대 실행하지 않음
   - 재시작 필요 시 사용자에게 안내만 할 것
2. **모든 백엔드 코드는 `com.mapo.palantier` 패키지 하위에 작성**
3. **WebSocket은 순수 WebSocket만 사용** — STOMP 금지
4. **API 호출 시 `/api` 중복 금지** — baseURL에 이미 `/api` 포함됨

---

## 로컬 개발 환경

| 항목 | 주소 |
|------|------|
| Backend | http://localhost:8080 |
| Frontend | http://localhost:5173 |
| DB | localhost:5432 / palantier / palantier_user / palantier_password |

---

## Git Commit 규칙

- `feat:` / `fix:` / `refactor:` / `docs:`
- 모든 커밋에 포함:
  ```
  🤖 Generated with Claude Code
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

---

## 상세 문서 (필요할 때 참조)

| 문서 | 내용 |
|------|------|
| [아키텍처](/docs/architecture.md) | DDD 패키지 구조, 프론트 라우팅 원칙 |
| [DB 관리](/docs/database.md) | 접속 정보, 스키마 변경 원칙, compose 설정 |
| [배포](/docs/deployment.md) | GitHub Actions, 수동 배포 |
| [권한 시스템](/docs/auth-system.md) | Role / Authority 구조 |
| [WebSocket](/docs/websocket.md) | 구현 원칙, 메시지 포맷 |
| [프론트 가이드](/docs/frontend-guide.md) | 컴포넌트, API 설정, TS 에러 패턴 |
| [해커톤](/docs/hackathon.md) | 해커톤 기능 현황, API, DB 테이블 |
| [Security 메뉴](/docs/security.md) | Security 페이지 구조, DB 테이블, 메뉴 등록, 새 문서 페이지 추가 패턴 |
| [배포 가이드 상세](/배포 가이드/) | AWS 인프라, GitHub Secrets, 트러블슈팅 |
