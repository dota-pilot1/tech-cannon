# AWS 인프라 상세 정보

## EC2 인스턴스

### 기본 정보
- **인스턴스 ID**: (AWS 콘솔에서 확인)
- **Public IP**: `43.200.241.26`
- **Private IP**: (EC2 내부에서 `hostname -I`로 확인)
- **인스턴스 타입**: (AWS 콘솔에서 확인)
- **리전**: ap-northeast-2 (서울)
- **가용 영역**: ap-northeast-2a (추정)
- **OS**: Ubuntu 24.04 LTS
- **키 페어 이름**: hibot-d-server-key

### 도메인 설정
- **백엔드 API**: api.dxline-tallent.com → 43.200.241.26:8080
- **프론트엔드**: dxline-tallent.com → CloudFront

### 보안 그룹
필요한 인바운드 규칙:
- SSH (22): 관리자 IP만 허용 권장
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- Custom (8080): 0.0.0.0/0 (백엔드 API)
- PostgreSQL (5432): localhost만 (외부 접속 불필요)

### SSH 접속
```bash
ssh -i "배포 가이드/hibot-d-server-key.pem" ubuntu@43.200.241.26
```

**주의**: PEM 파일 권한은 반드시 400이어야 함
```bash
chmod 400 "배포 가이드/hibot-d-server-key.pem"
```

---

## S3 버킷

### dxline-tallent-front
- **버킷 이름**: dxline-tallent-front
- **리전**: ap-northeast-2 (서울)
- **용도**: 프론트엔드 정적 파일 호스팅
- **퍼블릭 액세스**: CloudFront를 통해서만 접근

### 버킷 정책
CloudFront OAI(Origin Access Identity)를 통한 접근만 허용

### 업로드 명령어
```bash
aws s3 sync dist s3://dxline-tallent-front --delete
```

---

## CloudFront 배포

### 기본 정보
- **Distribution ID**: E11NF3HMOB52NI
- **도메인**: d1841s1y3ps0cj.cloudfront.net
- **Custom Domain**: dxline-tallent.com
- **Origin**: S3 버킷 (dxline-tallent-front)

### SSL/TLS 인증서
- AWS Certificate Manager (ACM)에서 발급
- 도메인: *.dxline-tallent.com, dxline-tallent.com

### Custom Error Responses
SPA 라우팅을 위한 설정:
- 403 → /index.html (Response Code: 200)
- 404 → /index.html (Response Code: 200)

### 캐시 무효화
```bash
aws cloudfront create-invalidation \
    --distribution-id E11NF3HMOB52NI \
    --paths "/*"
```

**비용**: 매월 1,000개의 무효화 경로까지 무료

---

## Route 53 (DNS)

### 호스팅 영역
- **도메인**: dxline-tallent.com

### 레코드
1. **A 레코드** (dxline-tallent.com)
   - Type: A - IPv4 address
   - Alias: CloudFront Distribution
   - Value: d1841s1y3ps0cj.cloudfront.net

2. **A 레코드** (api.dxline-tallent.com)
   - Type: A - IPv4 address
   - Value: 43.200.241.26

3. **CNAME 레코드** (www.dxline-tallent.com) - 선택사항
   - Type: CNAME
   - Value: dxline-tallent.com

---

## PostgreSQL (Docker on EC2)

### 컨테이너 정보
- **컨테이너 이름**: palantier-postgres
- **이미지**: postgres:16
- **포트**: 5432 (EC2 내부에서만 접근)

### 데이터베이스 정보
- **Database**: palantier
- **Username**: palantier_user
- **Password**: palantier_password

### Docker Compose 설정
파일 위치: EC2 `/home/ubuntu/compose.yaml` 또는 프로젝트 루트

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
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

### 로컬에서 EC2 PostgreSQL 접속
```bash
# SSH 터널링
ssh -i "배포 가이드/hibot-d-server-key.pem" \
    -L 5433:localhost:5432 \
    ubuntu@43.200.241.26

# 다른 터미널에서
psql -h localhost -p 5433 -U palantier_user -d palantier
```

### EC2 내부에서 직접 접속
```bash
docker exec -it palantier-postgres psql -U palantier_user -d palantier
```

---

## IAM 사용자 및 권한

### 배포용 IAM 사용자
필요한 권한:
- **S3**: s3:PutObject, s3:DeleteObject, s3:ListBucket (dxline-tallent-front 버킷)
- **CloudFront**: cloudfront:CreateInvalidation, cloudfront:GetInvalidation

### AWS CLI 설정
```bash
aws configure
# AWS Access Key ID: [IAM 사용자 키]
# AWS Secret Access Key: [IAM 사용자 시크릿]
# Default region name: ap-northeast-2
# Default output format: json
```

---

## 비용 최적화

### 예상 월간 비용
- **EC2**: 인스턴스 타입에 따라 다름
- **S3**: 저장 용량 + 요청 수 (약 $0.025/GB)
- **CloudFront**: 데이터 전송량 (처음 10TB까지 $0.085/GB)
- **Route 53**: 호스팅 영역 $0.50/월 + 쿼리 비용

### 비용 절감 팁
1. CloudFront 캐싱 최적화로 오리진 요청 감소
2. S3 Lifecycle 정책으로 오래된 백업 자동 삭제
3. EC2 인스턴스 타입 최적화 또는 Reserved Instance 사용
4. 불필요한 CloudFront 무효화 최소화

---

## 모니터링 및 알림

### CloudWatch Alarms (권장)
1. **EC2 CPU 사용률** > 80%
2. **EC2 메모리 사용률** > 80%
3. **백엔드 헬스체크 실패**
4. **CloudFront 5xx 에러율** > 5%

### 로그 확인
```bash
# 백엔드 애플리케이션 로그
ssh -i "배포 가이드/hibot-d-server-key.pem" ubuntu@43.200.241.26
tail -f /home/ubuntu/app.log

# PostgreSQL 로그
docker logs -f palantier-postgres
```

---

## 백업 전략

### 데이터베이스 백업
**자동 백업** (권장):
```bash
# EC2에서 cron 설정
crontab -e

# 매일 새벽 2시 백업
0 2 * * * docker exec palantier-postgres pg_dump -U palantier_user palantier > /home/ubuntu/backups/backup_$(date +\%Y\%m\%d).sql

# 30일 이상 된 백업 자동 삭제
0 3 * * * find /home/ubuntu/backups -name "backup_*.sql" -mtime +30 -delete
```

### S3 버킷 버전 관리
S3 버킷 버전 관리 활성화로 실수로 삭제된 파일 복구 가능

---

## 보안 권장사항

1. **SSH 키 관리**
   - PEM 파일을 안전한 곳에 보관
   - 정기적으로 키 페어 교체 (연 1회)
   - PEM 파일은 절대 Git에 커밋하지 않기

2. **데이터베이스 보안**
   - PostgreSQL은 localhost만 접근 허용
   - 강력한 비밀번호 사용
   - 정기적인 비밀번호 변경 (분기 1회)

3. **AWS 자격증명 보안**
   - IAM 사용자는 최소 권한 원칙 적용
   - MFA(Multi-Factor Authentication) 활성화
   - Access Key는 정기적으로 순환 (분기 1회)

4. **HTTPS 강제**
   - CloudFront에서 HTTP → HTTPS 리다이렉트 설정
   - HSTS(HTTP Strict Transport Security) 헤더 추가

---

## 장애 대응 절차

### 1. 백엔드 다운
```bash
# 1. 프로세스 상태 확인
ssh -i "배포 가이드/hibot-d-server-key.pem" ubuntu@43.200.241.26
ps aux | grep java

# 2. 로그 확인
tail -100 /home/ubuntu/app.log

# 3. 재시작
nohup java -jar /home/ubuntu/parantier-api-0.0.1-SNAPSHOT.jar \
    --spring.profiles.active=prod \
    > /home/ubuntu/app.log 2>&1 &
```

### 2. 프론트엔드 문제
```bash
# CloudFront 캐시 전체 무효화
aws cloudfront create-invalidation \
    --distribution-id E11NF3HMOB52NI \
    --paths "/*"

# S3에 직접 재배포
cd parantier-front
npm run build
aws s3 sync dist s3://dxline-tallent-front --delete
```

### 3. 데이터베이스 문제
```bash
# PostgreSQL 상태 확인
docker ps | grep palantier-postgres

# 로그 확인
docker logs palantier-postgres --tail 100

# 재시작
docker restart palantier-postgres
```

---

**마지막 업데이트**: 2026-03-27
**작성자**: Claude Code
