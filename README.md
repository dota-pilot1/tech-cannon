# Palantier

마포구 팔란티어 프로젝트 — 업무 관리 및 이슈 트래킹 웹 애플리케이션

---

## 기술 스택

### 프론트엔드
- React + TypeScript + Vite
- TanStack Router, TanStack Query
- Tailwind CSS, shadcn/ui
- AG Grid, React Hook Form

### 백엔드
- Spring Boot 3 (Java 17)
- Spring Security + JWT
- PostgreSQL (Docker)
- AWS S3

---

## 로컬 개발 환경 실행

### 백엔드

1. `application-local.yml` 생성 (Git 제외 파일 — 직접 만들어야 함)

```
parantier-api/src/main/resources/application-local.yml
```

```yaml
aws:
  s3:
    access-key-id: YOUR_AWS_ACCESS_KEY_ID
    secret-access-key: YOUR_AWS_SECRET_ACCESS_KEY
    bucket-name: hibot-docu
    region: ap-northeast-2
```

2. 실행

```bash
cd parantier-api
./gradlew bootRun --args='--spring.profiles.active=local'
```

### 프론트엔드

```bash
cd parantier-front
npm install
npm run dev
```

로컬 API 주소: `http://localhost:8080/api`

---

## 배포

| 항목 | 값 |
|---|---|
| 프론트엔드 | https://dxline-tallent.com |
| 백엔드 API | https://api.dxline-tallent.com |
| 헬스체크 | https://api.dxline-tallent.com/actuator/health |
| S3 버킷 | `dxline-tallent-front` |
| CloudFront ID | `E11NF3HMOB52NI` |
| EC2 | `43.200.241.26` (ap-northeast-2) |

### 자동 배포 (GitHub Actions) ⚡

**권장 배포 방법**: 코드를 커밋하고 푸시하면 자동으로 배포됩니다.

```bash
git add -A
git commit -m "feat: 새 기능 추가"
git push  # 자동 배포 트리거
```

**배포 워크플로우:**
- `parantier-front/**` 변경 → S3 + CloudFront 자동 배포 (2-3분)
- `parantier-api/**` 변경 → EC2 자동 배포 (3-5분)
- 수동 트리거: GitHub Actions 탭에서 `workflow_dispatch` 실행

**배포 문서:**
- [GitHub Actions 배포 가이드](배포%20가이드/GitHub_Actions_배포.md) ⭐
- [수동 배포 가이드](배포%20가이드/배포_가이드.md)
- [빠른 참조](배포%20가이드/빠른_참조.md)

---

## 프로젝트 구조

```
mapo-palantier-project/
├── parantier-front/       # React 프론트엔드
├── parantier-api/         # Spring Boot 백엔드
├── .github/workflows/     # GitHub Actions 배포 자동화
└── 배포 가이드/            # 배포 관련 문서 모음
```
