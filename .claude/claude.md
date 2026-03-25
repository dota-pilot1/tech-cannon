# Claude Code 설정

## 자동 커밋 & 푸시

변경사항을 완료한 후에는 자동으로 git commit과 push를 수행합니다.

### 커밋 규칙
- feat: 새로운 기능 추가
- fix: 버그 수정
- refactor: 코드 리팩토링
- style: UI/스타일 변경
- docs: 문서 수정
- chore: 빌드/설정 변경

### 커밋 메시지 형식
```
<type>: <subject>

- <상세 내용 1>
- <상세 내용 2>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 자동화 동작
1. 변경사항 완료 시 자동으로 `git add` 수행
2. 적절한 커밋 메시지 작성 후 `git commit` 수행
3. 자동으로 `git push` 수행
4. 사용자 확인 없이 진행

## 프로젝트 구조

### Backend (Spring Boot)
- `parantier-api/`: API 서버
  - Java 17
  - Spring Boot 3.4.3
  - MyBatis
  - PostgreSQL

### Frontend (React)
- `parantier-front/`: 프론트엔드 앱
  - React 19
  - TypeScript
  - Vite
  - TanStack Query
  - TanStack Router
  - Tailwind CSS
  - shadcn/ui

## 데이터베이스 관리 정책

**중요: Flyway Migration 사용 금지**

이 프로젝트에서는 Flyway를 통한 자동 마이그레이션을 사용하지 않습니다. 대신 직접 SQL을 실행하여 DB를 업데이트합니다.

### DB 변경 시 절차
1. `src/main/resources/db/migration/` 폴더에 마이그레이션 파일 작성 (참고용)
2. **직접 PostgreSQL에 접속하여 SQL 실행**
3. 변경사항 커밋 및 푸시

### 이유
- 프로덕션 환경에서 수동으로 DB 스키마를 관리
- 마이그레이션 실패 시 롤백 복잡도 증가 방지
- 명시적인 DB 변경 관리

## 데이터베이스 접속 정보

### PostgreSQL (Docker)
```bash
# Docker 컨테이너 접속
docker exec -it palantier-postgres psql -U palantier_user -d palantier

# 또는 직접 접속
psql -h localhost -p 5432 -U palantier_user -d palantier
```

**접속 정보:**
- Host: `localhost`
- Port: `5432`
- Database: `palantier`
- Username: `palantier_user`
- Password: `palantier_password`

**주요 테이블:**
- `users`: 사용자 정보
- `menus`: 메뉴 구조
- `authorities`: 권한 정보
- `user_authorities`: 사용자-권한 매핑
- `refresh_tokens`: 리프레시 토큰
- `organizations`: 조직 구조

**유용한 쿼리:**
```sql
-- 메뉴 구조 확인
SELECT id, name, parent_id, menu_type, path, order_num
FROM menus
ORDER BY parent_id NULLS FIRST, order_num;

-- 사용자 목록
SELECT id, username, email, role, organization_id, is_active
FROM users;

-- 권한 목록
SELECT * FROM authorities ORDER BY category, name;
```
