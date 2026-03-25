# PostgreSQL 접속 및 기본 사용법

## 프로젝트 DB 접속 정보

### 연결 정보
```yaml
Host: localhost
Port: 5432
Database: palantier
Username: palantier_user
Password: palantier_password
```

## 1. 터미널에서 접속하기

### 기본 접속
```bash
psql -h localhost -U palantier_user -d palantier
# 비밀번호 입력: palantier_password
```

### 비밀번호 없이 접속 (환경변수 사용)
```bash
PGPASSWORD=palantier_password psql -h localhost -U palantier_user -d palantier
```

### 접속 후 종료
```sql
\q
-- 또는 Ctrl+D
```

## 2. 자주 사용하는 psql 명령어

### 데이터베이스 관련
```sql
-- 데이터베이스 목록 보기
\l

-- 현재 연결된 데이터베이스 확인
\conninfo

-- 다른 데이터베이스로 전환
\c database_name
```

### 테이블 관련
```sql
-- 현재 데이터베이스의 모든 테이블 목록
\dt

-- 특정 스키마의 테이블 목록
\dt public.*

-- 테이블 구조 확인 (DESCRIBE)
\d table_name

-- 테이블의 상세 정보 (인덱스, 제약조건 포함)
\d+ table_name
```

### 스키마/권한 관련
```sql
-- 모든 스키마 보기
\dn

-- 사용자 목록
\du

-- 권한 확인
\dp table_name
```

### 쿼리 관련
```sql
-- SQL 파일 실행
\i /path/to/file.sql

-- 쿼리 결과를 파일로 저장
\o /path/to/output.txt
SELECT * FROM users;
\o  -- 파일 출력 종료

-- 실행 시간 표시
\timing
```

### 출력 형식
```sql
-- 확장 표시 모드 (세로로 보기)
\x
SELECT * FROM users;
\x  -- 다시 토글하여 끄기

-- HTML 형식으로 출력
\H
```

## 3. 기본 SQL 쿼리

### 조회 (SELECT)
```sql
-- 전체 데이터 조회
SELECT * FROM menus;

-- 특정 컬럼만 조회
SELECT id, name, menu_type FROM menus;

-- 조건부 조회
SELECT * FROM menus WHERE menu_type = 'HEADER';

-- 정렬
SELECT * FROM menus ORDER BY order_num, id;

-- 개수 제한
SELECT * FROM menus LIMIT 10;
```

### 삽입 (INSERT)
```sql
-- 단일 행 삽입
INSERT INTO menus (name, menu_type, path, required_role, order_num, is_active)
VALUES ('새 메뉴', 'HEADER', '/new-menu', 'ADMIN', 3, true);

-- 여러 행 삽입
INSERT INTO menus (name, menu_type, order_num) VALUES
  ('메뉴1', 'SIDE', 1),
  ('메뉴2', 'SIDE', 2);
```

### 수정 (UPDATE)
```sql
-- 단일 행 수정
UPDATE menus
SET menu_type = 'HEADER', parent_id = NULL
WHERE id = 10;

-- 조건부 일괄 수정
UPDATE menus
SET is_active = false
WHERE menu_type = 'SIDE';
```

### 삭제 (DELETE)
```sql
-- 특정 행 삭제
DELETE FROM menus WHERE id = 2;

-- 조건부 삭제
DELETE FROM menus WHERE is_active = false;

-- 전체 삭제 (주의!)
DELETE FROM menus;
```

## 4. 트랜잭션

```sql
-- 트랜잭션 시작
BEGIN;

-- 여러 쿼리 실행
UPDATE menus SET menu_type = 'HEADER' WHERE id = 10;
UPDATE menus SET menu_type = 'HEADER' WHERE id = 11;
DELETE FROM menus WHERE id = 2;

-- 확인 후 커밋
COMMIT;

-- 또는 문제 발생 시 롤백
ROLLBACK;
```

## 5. 프로젝트에서 자주 사용하는 쿼리

### 메뉴 구조 확인
```sql
-- 전체 메뉴 계층 구조
SELECT
  id,
  name,
  menu_type,
  parent_id,
  path,
  required_role,
  order_num,
  is_active
FROM menus
ORDER BY order_num, id;
```

### 사용자 확인
```sql
-- 전체 사용자 목록
SELECT id, username, email, role, created_at
FROM users;

-- 관리자만 조회
SELECT * FROM users WHERE role = 'ROLE_ADMIN';
```

### 권한별 메뉴 확인
```sql
-- ADMIN 권한이 필요한 메뉴
SELECT name, path FROM menus WHERE required_role = 'ADMIN';

-- 공개 메뉴 (권한 없음)
SELECT name, path FROM menus WHERE required_role IS NULL;
```

## 6. 유용한 팁

### 쿼리 실행 시간 측정
```sql
\timing
SELECT * FROM users;
-- Time: 0.524 ms
```

### 에러 발생 시 계속 진행
```sql
\set ON_ERROR_STOP off
-- 이제 에러가 발생해도 스크립트 계속 실행
```

### 쿼리 히스토리 보기
```bash
# psql 명령 히스토리는 ~/.psql_history에 저장됨
cat ~/.psql_history
```

### 자동 완성 사용
```sql
-- TAB 키를 눌러 테이블명, 컬럼명 자동완성
SELECT * FROM me[TAB]  -- menus로 자동완성
```

## 7. GUI 도구 추천

### DBeaver (무료, 크로스플랫폼)
```bash
brew install --cask dbeaver-community
```

### pgAdmin (공식 GUI)
```bash
brew install --cask pgadmin4
```

### DataGrip (유료, JetBrains)
- 가장 강력하지만 유료 (IntelliJ 계열)

## 8. 백업 및 복원

### 데이터베이스 백업
```bash
pg_dump -h localhost -U palantier_user palantier > backup.sql
```

### 특정 테이블만 백업
```bash
pg_dump -h localhost -U palantier_user -t menus palantier > menus_backup.sql
```

### 복원
```bash
psql -h localhost -U palantier_user palantier < backup.sql
```

## 9. 성능 관련

### 실행 계획 보기
```sql
EXPLAIN SELECT * FROM menus WHERE menu_type = 'HEADER';

-- 실제 실행 통계 포함
EXPLAIN ANALYZE SELECT * FROM menus WHERE menu_type = 'HEADER';
```

### 인덱스 확인
```sql
-- 특정 테이블의 인덱스 목록
SELECT * FROM pg_indexes WHERE tablename = 'menus';
```

## 10. 문제 해결

### 접속 실패 시
```bash
# PostgreSQL 서비스 상태 확인
brew services list | grep postgresql

# 서비스 시작
brew services start postgresql@14

# 서비스 재시작
brew services restart postgresql@14
```

### 비밀번호 오류 시
```bash
# application.yml의 비밀번호 확인
cat parantier-api/src/main/resources/application.yml | grep password
```

### 권한 오류 시
```sql
-- 사용자 권한 확인
\du

-- 권한 부여 (슈퍼유저로 접속 필요)
GRANT ALL PRIVILEGES ON DATABASE palantier TO palantier_user;
```
