# 배포 가이드

> 상세 내용: `/배포 가이드/` 디렉토리 참고

## 권장: GitHub Actions 자동 배포

```bash
git add -A
git commit -m "feat: 새 기능"
git push
```

### 트리거 조건

| 경로 변경 | 실행되는 워크플로우 |
|-----------|-------------------|
| `parantier-front/**` | 프론트 배포 |
| `parantier-api/**` | 백엔드 배포 |

> 해당 경로 변경이 없으면 Actions 미트리거 → 수동 배포 필요

## 프론트 수동 배포

```bash
cd parantier-front
npm ci
VITE_API_URL=https://api.dxline-tallent.com/api \
VITE_WS_URL=wss://api.dxline-tallent.com/ws \
npm run build

aws s3 sync dist/ s3://dxline-tallent-front --delete
aws cloudfront create-invalidation \
  --distribution-id E11NF3HMOB52NI \
  --paths "/*"
```

## 전체 수동 배포 (긴급)

```bash
./deploy-all.sh
```

## 배포 환경 접속

```bash
# SSH 접속
ssh -i "/Users/terecal/mapo-palantier-project/배포 가이드/hibot-d-server-key.pem" ubuntu@43.200.241.26

# 배포 DB 접속 (SSH 접속 후)
PGPASSWORD=palantier_password psql -h localhost -p 5432 -U palantier_user -d palantier

# 백엔드 로그 확인
ssh -i "/Users/terecal/mapo-palantier-project/배포 가이드/hibot-d-server-key.pem" ubuntu@43.200.241.26 "tail -f /home/ubuntu/app.log"

# 헬스체크
curl https://api.dxline-tallent.com/actuator/health
```

| 항목 | 값 |
|------|-----|
| EC2 IP | 43.200.241.26 |
| Frontend URL | https://dxline-tallent.com |
| Backend API URL | https://api.dxline-tallent.com |
| S3 Bucket | dxline-tallent-front |
| CloudFront ID | E11NF3HMOB52NI |

## 상세 문서

- [빠른 참조](/배포 가이드/빠른_참조.md)
- [AWS 인프라 정보](/배포 가이드/AWS_인프라_정보.md)
- [GitHub Actions 배포](/배포 가이드/GitHub_Actions_배포.md)
- [트러블슈팅 이력](/배포 가이드/트러블슈팅_이력.md)
