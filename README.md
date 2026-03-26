# Palantier 프로젝트

## 백엔드 실행 방법 (교과서적 Spring Boot 방식)

### 1. application-local.yml 생성 (필수)

**⚠️ 중요: 이 파일은 Git에 커밋되지 않으므로 각 개발자가 직접 생성해야 합니다.**

`parantier-api/src/main/resources/application-local.yml` 파일을 생성하고 다음 내용을 입력합니다:

```yaml
# Local Development Configuration
aws:
  s3:
    access-key-id: YOUR_AWS_ACCESS_KEY_ID
    secret-access-key: YOUR_AWS_SECRET_ACCESS_KEY
    bucket-name: hibot-docu
    region: ap-northeast-2
```

**참고:**
- 이 파일은 `.gitignore`에 포함되어 있어 Git에 업로드되지 않습니다.
- 팀원들에게 이 파일 생성이 필요하다는 것을 공유해야 합니다.
- AWS 키는 개발 환경에서만 사용되는 키입니다.

### 2. 백엔드 실행

```bash
cd parantier-api
./gradlew bootRun --args='--spring.profiles.active=local'
```

또는 환경 변수로 설정:

```bash
export SPRING_PROFILES_ACTIVE=local
cd parantier-api
./gradlew bootRun
```

## 프론트엔드 실행

### 1. .env 파일 생성 (선택사항)

프론트엔드는 현재 `.env` 파일이 필요하지 않지만, 향후 API URL 등을 설정하려면 다음 형식으로 생성할 수 있습니다:

`parantier-front/.env` (또는 `.env.local`):

```bash
# API Configuration (예시)
VITE_API_URL=http://localhost:8080/api

# 기타 환경 변수...
```

### 2. 프론트엔드 실행

```bash
cd parantier-front
npm run dev
```

## 환경 설정 파일 구조

```
parantier-api/
├── src/main/resources/
│   ├── application.yml          # 기본 설정 (환경 변수 플레이스홀더)
│   └── application-local.yml    # 로컬 개발용 (Git 제외)
```

## Spring Boot Profile 시스템

- `application.yml`: 모든 환경에서 공통으로 사용되는 설정
- `application-local.yml`: 로컬 개발 환경 전용
- `application-prod.yml`: 프로덕션 환경 전용 (필요시)

실행 시 `--spring.profiles.active=local`을 지정하면 `application-local.yml`이 `application.yml`을 오버라이드합니다.
