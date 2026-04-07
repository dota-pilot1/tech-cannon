# 데이터베이스 관리

## 접속 정보

| 항목 | 값 |
|------|-----|
| Host | localhost |
| Port | 5432 |
| Database | palantier |
| Username | palantier_user |
| Password | palantier_password |

## 로컬 접속 (Docker)

```bash
# 방법 1: docker exec
docker exec -i palantier-postgres psql -U palantier_user -d palantier

# 방법 2: psql 직접 (결과 동일)
PGPASSWORD=palantier_password psql -h localhost -U palantier_user -d palantier
```

## EC2 서버 접속

```bash
ssh -i "/Users/terecal/mapo-palantier-project/배포 가이드/hibot-d-server-key.pem" ubuntu@43.200.241.26 \
  "PGPASSWORD=palantier_password psql -h localhost -p 5432 -U palantier_user -d palantier -c \"SQL문\""
```

## ⚠️ DB 변경 원칙

- **Flyway는 히스토리용** — EC2 `application.yml`에 Flyway 설정 없어서 자동 실행 안 됨
- 스키마 변경 시 **로컬 + EC2 DB에 직접 SQL 실행** 필수

### 새 테이블 추가 순서

1. `db/migration/Vxx__설명.sql` 파일 생성 (히스토리용)
2. 로컬 Docker DB에 직접 SQL 실행
3. EC2 DB에 직접 SQL 실행
4. 백엔드 코드 작성 → 커밋/푸시/배포

## compose.yaml

```yaml
services:
  postgres:
    image: 'postgres:16'
    container_name: palantier-postgres
    environment:
      - 'POSTGRES_DB=palantier'
      - 'POSTGRES_USER=palantier_user'
      - 'POSTGRES_PASSWORD=palantier_password'
    ports:
      - '5432:5432'
```
