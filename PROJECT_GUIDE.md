# Palantier Project Guide

## 프로젝트 개요
개발자 관리 및 개발 관리 프로그램

## 기술 스택

### Backend
- **Framework**: Spring Boot 4.0.4
- **Language**: Java 21
- **Database**: PostgreSQL 16
- **ORM**: MyBatis (기본 전략)
- **Architecture**: DDD (Domain-Driven Design)
- **Build Tool**: Gradle

### 주요 라이브러리
- Spring Security (인증/인가)
- Spring Boot Actuator (헬스체크/모니터링)
- SpringDoc OpenAPI (Swagger UI)
- Lombok
- PostgreSQL Driver

## 아키텍처 결정

### 1. MyBatis 사용
- JPA 대신 MyBatis를 기본 ORM으로 사용
- SQL을 직접 작성하여 완전한 제어
- 복잡한 쿼리 및 통계/리포트에 유리

### 2. DDD 구조
```
com.mapo.palantier
├─ user (사용자 도메인)
│  ├─ domain
│  ├─ application
│  ├─ infrastructure
│  └─ presentation
├─ project (프로젝트 도메인)
├─ developer (개발자 도메인)
├─ task (태스크 도메인)
└─ shared (공통)
```

### 3. DB 스키마 관리
- **방식**: Flyway 대신 직접 SQL로 관리
- **실행 방법**: Docker PostgreSQL 컨테이너에 직접 SQL 실행
- **중요**: 테이블 추가/변경 시 반드시 SQL 파일로 기록 및 실행

#### 테이블 생성 예시
```bash
# Docker 컨테이너에 직접 SQL 실행
docker exec palantier-postgres psql -U palantier_user -d palantier -c "
CREATE TABLE IF NOT EXISTS table_name (...);
"

# 또는 SQL 파일 실행
docker exec -i palantier-postgres psql -U palantier_user -d palantier < script.sql
```

#### SQL 파일 관리 (선택사항)
- **위치**: `parantier-api/src/main/resources/db/migration/`
- **파일명**: `V{숫자}__{설명}.sql` (예: `V4__create_menus_table.sql`)
- **용도**: 참고용 기록 (자동 실행 안 됨, 직접 실행 필요)

## 데이터베이스

### 환경
- **관리**: Docker Compose로 PostgreSQL 컨테이너 실행
- **위치**: `docker-compose.yml` 파일로 설정 관리

### 연결 정보
- Host: localhost
- Port: 5432
- Database: palantier
- Username: palantier_user
- Password: palantier_password

### Docker 명령어
```bash
docker compose up -d  # PostgreSQL 시작
docker compose down   # PostgreSQL 종료
docker compose ps     # 실행 중인 컨테이너 확인
```

### psql 접속
```bash
docker compose exec postgres psql -U palantier_user -d palantier
```

## API 문서
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health Check: http://localhost:8080/actuator/health

## 개발 원칙
1. MyBatis로 SQL 직접 작성
2. DDD 도메인별 패키지 분리
3. Git commit에 마이그레이션 정보 명시
4. Security 설정 엄격히 관리
5. **백엔드 서버 시작은 사용자가 직접 수행 (Claude는 서버 시작하지 않음)**

## 파일 인코딩
- **중요**: 모든 텍스트 파일은 UTF-8 인코딩 사용
- 한글이 포함된 파일 생성 시 UTF-8 명시 필요

## 문서 작성 원칙
- **예제 중심의 직관적 설명 선호**
- 긴 이론적 설명보다 간결한 코드 예제 우선
- 핵심 질문과 답변을 먼저 제시
- 불필요한 반복 설명 제거

## Swagger 어노테이션 사용법
Controller에서 API 문서화 시 다음 어노테이션 사용:
- `@Tag`: API 그룹 정의 (Controller 레벨)
- `@Operation`: API 설명 (메서드 레벨)
- `@Schema`: DTO 필드 설명 (필드 레벨)

자세한 내용: `/docs/docs-for-swagger/스웨거 사용법.txt`

## 현재 진행 상황
- [x] 프로젝트 초기 설정
- [x] Docker PostgreSQL 설정
- [x] Spring Security 기본 설정 + PasswordEncoder
- [x] Swagger/OpenAPI 설정
- [x] Actuator 설정
- [x] User 테이블 생성
- [x] 회원가입 API 구현 (DDD 구조)
  - Domain: User, UserRole, UserRepository
  - Infrastructure: UserMapper, UserRepositoryImpl
  - Application: AuthService
  - Presentation: AuthController, DTO
- [ ] JWT 인증 구현
- [ ] 로그인 API
