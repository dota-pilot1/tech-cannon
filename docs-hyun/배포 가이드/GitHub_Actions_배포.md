# GitHub Actions 자동 배포

## 개요

이 프로젝트는 GitHub Actions를 통해 자동 배포가 설정되어 있습니다.
코드를 커밋하고 푸시하면 자동으로 빌드 및 배포가 진행됩니다.

## 배포 방법

### 1. 코드 변경 후 커밋 & 푸시

```bash
# 변경사항 확인
git status

# 모든 변경사항 스테이징
git add -A

# 커밋
git commit -m "feat: 새로운 기능 추가"

# 푸시 (자동 배포 트리거)
git push
```

### 2. GitHub Actions 진행 상황 확인

1. GitHub 저장소 접속: https://github.com/dota-pilot1/tech-cannon
2. **Actions** 탭 클릭
3. 최근 워크플로우 실행 확인

### 3. 배포 완료 확인

**프론트엔드:**
- URL: https://dxline-tallent.com
- 배포 시간: 약 2-3분

**백엔드:**
- URL: https://api.dxline-tallent.com
- 배포 시간: 약 3-5분
- 헬스체크: `curl https://api.dxline-tallent.com/actuator/health`

## 워크플로우 구성

### 프론트엔드 워크플로우

**파일:** `.github/workflows/deploy-frontend.yml`

**트리거:**
- `main` 브랜치에 push
- `parantier-front/**` 경로 변경 시
- 수동 트리거 (workflow_dispatch)

**배포 단계:**
1. 코드 체크아웃
2. Node.js 18 설치
3. 의존성 설치 (`npm ci`)
4. 환경 변수 주입 (`.env.production` 생성)
5. 빌드 (`npm run build`)
6. S3에 업로드 (`aws s3 sync`)
7. CloudFront 캐시 무효화

### 백엔드 워크플로우

**파일:** `.github/workflows/deploy-backend.yml`

**트리거:**
- `main` 브랜치에 push
- `parantier-api/**` 경로 변경 시
- 수동 트리거 (workflow_dispatch)

**배포 단계:**
1. 코드 체크아웃
2. Java 17 설치
3. Gradle 빌드 (`./gradlew clean bootJar`)
4. JAR 파일 EC2로 전송 (SCP)
5. 백엔드 서버 재시작 (SSH)

## 수동 배포 트리거

GitHub Actions 웹 UI에서 수동으로 배포를 실행할 수 있습니다.

1. GitHub 저장소 > **Actions** 탭
2. 원하는 워크플로우 선택
   - Deploy Frontend
   - Deploy Backend
3. **Run workflow** 버튼 클릭
4. 브랜치 선택 (기본: main)
5. **Run workflow** 클릭

## 환경 변수 (GitHub Secrets)

배포에 필요한 환경 변수는 GitHub Secrets에 저장되어 있습니다.

**필요한 Secrets:**
- `AWS_ACCESS_KEY_ID` - AWS 액세스 키
- `AWS_SECRET_ACCESS_KEY` - AWS 시크릿 키
- `EC2_HOST` - EC2 서버 IP (43.200.241.26)
- `EC2_USERNAME` - EC2 사용자 이름 (ubuntu)
- `EC2_SSH_KEY` - EC2 SSH 개인 키 (PEM)
- `VITE_API_URL` - 프론트엔드 API URL
- `VITE_WS_URL` - WebSocket URL

**Secrets 확인/수정:**
1. GitHub 저장소 > **Settings** 탭
2. 좌측 메뉴 > **Secrets and variables** > **Actions**
3. Repository secrets 확인

자세한 내용: [GITHUB_SECRETS.md](./GITHUB_SECRETS.md)

## 로그 확인

### GitHub Actions 로그

1. GitHub > Actions 탭
2. 워크플로우 실행 클릭
3. 각 Job 및 Step의 로그 확인

### 배포 서버 로그

```bash
# SSH 접속
ssh -i "/Users/terecal/dxline-container/hibot-d-server-key 복사본.pem" ubuntu@43.200.241.26

# 백엔드 로그 확인
tail -f /home/ubuntu/app.log

# 특정 키워드 검색
tail -100 /home/ubuntu/app.log | grep -i "error"
```

## 배포 실패 시 대처

### 1. GitHub Actions 실패

**확인 사항:**
- Actions 탭에서 실패한 Step 로그 확인
- 빌드 에러인지, 배포 에러인지 파악
- Secrets 값이 올바른지 확인

**자주 발생하는 에러:**
- 빌드 실패: 타입 에러, 의존성 문제
- S3 업로드 실패: AWS 권한 문제
- SSH 연결 실패: EC2_SSH_KEY 형식 문제

### 2. 배포 후 서버 오류

```bash
# 백엔드 헬스체크
curl https://api.dxline-tallent.com/actuator/health

# 프론트엔드 확인
curl -I https://dxline-tallent.com

# 로그 확인
ssh -i "/Users/terecal/dxline-container/hibot-d-server-key 복사본.pem" ubuntu@43.200.241.26 "tail -50 /home/ubuntu/app.log"
```

### 3. 롤백

이전 커밋으로 롤백하고 다시 푸시:

```bash
# 이전 커밋 확인
git log --oneline -5

# 이전 커밋으로 되돌리기
git reset --hard <commit-hash>

# 강제 푸시 (주의!)
git push -f origin main
```

## 수동 배포와 비교

### GitHub Actions (자동 배포)
✅ 장점:
- 커밋만 하면 자동 배포
- 일관된 배포 프로세스
- 로그 기록 자동 보관
- 로컬 환경 설정 불필요

❌ 단점:
- 배포 시간이 조금 더 걸림 (빌드 환경 준비)
- GitHub Actions 사용량 제한 (무료: 2000분/월)

### 수동 배포 (스크립트 실행)
✅ 장점:
- 빠른 배포 가능
- 세밀한 제어 가능
- GitHub Actions 사용량 절약

❌ 단점:
- 로컬에 AWS CLI, SSH 설정 필요
- 수동 실행 필요
- 배포 과정 실수 가능성

**권장:**
- 일반적인 배포: GitHub Actions 사용
- 긴급 수정: 수동 배포 스크립트 사용

## 참고 문서

- [배포 가이드](./배포_가이드.md) - 수동 배포 방법
- [빠른 참조](./빠른_참조.md) - 자주 사용하는 명령어
- [GitHub Secrets](./GITHUB_SECRETS.md) - 환경 변수 설정
- [트러블슈팅](./트러블슈팅_이력.md) - 문제 해결 사례

---

**마지막 업데이트**: 2026-03-28
