# Palantier 프로젝트

## 프로젝트 개요

사내 개발팀을 위한 올인원 협업 플랫폼.
- **Backend**: Spring Boot 4 / MyBatis / PostgreSQL (`parantier-api/`)
- **Frontend**: React + TypeScript / TanStack Router (`parantier-front/`)

---

## ⚠️ 절대 규칙 (항상 적용)

1. **모든 백엔드 코드는 `com.mapo.palantier` 패키지 하위에 작성**
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

## CI/CD 자동 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 배포합니다.

| 변경 경로 | 트리거되는 워크플로우 | 배포 대상 | 소요 시간 |
|-----------|----------------------|----------|----------|
| `parantier-front/**` | Deploy Frontend | S3 + CloudFront | ~2-3분 |
| `parantier-api/**` | Deploy Backend | EC2 (JAR 교체 + 재시작) | ~3-5분 |

- **경로 기반 트리거**: 해당 경로 변경이 없으면 워크플로우가 실행되지 않음
- **수동 트리거**: GitHub Actions 탭 > Run workflow 버튼으로 수동 실행 가능
- **배포 상태 확인**: https://github.com/dota-pilot1/tech-cannon/actions
- **워크플로우 파일**: `.github/workflows/deploy-frontend.yml`, `.github/workflows/deploy-backend.yml`

### 배포 후 확인

```bash
# 백엔드 헬스체크
curl https://api.dxline-tallent.com/actuator/health

# 프론트엔드 확인
curl -I https://dxline-tallent.com

# 백엔드 로그 (문제 발생 시)
ssh -i "/Users/terecal/dxline-container/hibot-d-server-key 복사본.pem" ubuntu@43.200.241.26 "tail -50 /home/ubuntu/app.log"
```

---

## 배포 환경 접속

| 항목 | 주소 |
|------|------|
| Frontend | https://dxline-tallent.com |
| Backend API | https://api.dxline-tallent.com |
| EC2 SSH | `ssh -i "/Users/terecal/dxline-container/hibot-d-server-key 복사본.pem" ubuntu@43.200.241.26` |
| 배포 DB | EC2 SSH 접속 후 `PGPASSWORD=palantier_password psql -h localhost -p 5432 -U palantier_user -d palantier` |
| Health Check | `curl https://api.dxline-tallent.com/actuator/health` |

> **주의**: 배포 DB는 EC2 내부에서만 접근 가능 (SSH 터널 필요)

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
| [배포 가이드 상세](/docs-hyun/배포 가이드/) | AWS 인프라, GitHub Secrets, 트러블슈팅 |
