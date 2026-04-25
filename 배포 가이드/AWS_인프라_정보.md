# AWS 인프라 정보

## EC2

- **IP**: `43.200.241.26`
- **OS**: Ubuntu 24.04 LTS
- **리전**: ap-northeast-2 (서울)
- **SSH**: `ssh -i "/Users/terecal/mapo-palantier-project/배포 가이드/hibot-d-server-key.pem" ubuntu@43.200.241.26`

### 보안 그룹 인바운드
- SSH (22): 관리자 IP만
- HTTP (80), HTTPS (443): 0.0.0.0/0
- Custom (8080): 0.0.0.0/0

## PostgreSQL (호스트 설치)

- **Host**: localhost (EC2 내부)
- **Port**: 5432
- **Database**: palantier
- **Username**: palantier_user
- **Password**: palantier_password

**접속**:
```bash
ssh -i "/Users/terecal/mapo-palantier-project/배포 가이드/hibot-d-server-key.pem" ubuntu@43.200.241.26
PGPASSWORD=palantier_password psql -h localhost -p 5432 -U palantier_user -d palantier
```

## S3

- **버킷**: dxline-tallent-front
- **리전**: ap-northeast-2
- **용도**: 프론트엔드 정적 파일

## CloudFront

- **Distribution ID**: E11NF3HMOB52NI
- **도메인**: d1841s1y3ps0cj.cloudfront.net
- **Custom Domain**: dxline-tallent.com

### Custom Error Responses
- 403 → /index.html (200)
- 404 → /index.html (200)

## Route 53

- **도메인**: dxline-tallent.com
- **A 레코드**: dxline-tallent.com → CloudFront
- **A 레코드**: api.dxline-tallent.com → 43.200.241.26

---

**마지막 업데이트**: 2026-03-28
