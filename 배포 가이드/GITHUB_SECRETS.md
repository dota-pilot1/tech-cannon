# GitHub Secrets 설정 가이드

## 설정 위치
`https://github.com/dota-pilot1/tech-cannon/settings/secrets/actions`

Settings → Secrets and variables → Actions → New repository secret

---

## 필수 Secrets 목록 (총 15개)

### 1. AWS 관련 (6개)

#### AWS_ACCESS_KEY_ID
```
Value: (AWS IAM 콘솔에서 확인)
```
- 위치: AWS Console → IAM → Users → Security credentials

#### AWS_SECRET_ACCESS_KEY
```
Value: (AWS IAM 콘솔에서 확인)
```
- 위치: AWS Console → IAM → Users → Security credentials

#### AWS_REGION
```
Value: ap-northeast-2
```

#### AWS_S3_BUCKET_NAME
```
Value: dxline-tallent-front
```
- **프론트엔드 빌드 결과물**을 업로드할 S3 버킷

#### AWS_S3_BUCKET_NAME_BACKEND
```
Value: hibot-docu
```
- **백엔드 이미지 업로드**용 S3 버킷

#### AWS_CLOUDFRONT_DISTRIBUTION_ID
```
Value: E11NF3HMOB52NI
```
- 프론트엔드용 CloudFront Distribution
- Domain: d1841s1y3ps0cj.cloudfront.net

---

### 2. EC2 관련 (3개)

#### EC2_HOST
```
Value: 43.200.241.26
```

#### EC2_USER
```
Value: ubuntu
```

#### EC2_SSH_PRIVATE_KEY
```
Value: (아래 명령으로 PEM 파일 전체 내용 복사)
```

**PEM 키 확인 명령:**
```bash
cat "/Users/terecal/mapo-palantier-project/배포 가이드/hibot-d-server-key.pem"
```

**주의사항:**
- `-----BEGIN RSA PRIVATE KEY-----` 부터
- `-----END RSA PRIVATE KEY-----` 까지
- 전체 내용을 복사해서 붙여넣기

---

### 3. 데이터베이스 관련 (5개)

#### DB_HOST
```
Value: localhost
```

#### DB_PORT
```
Value: 5432
```

#### DB_NAME
```
Value: palantier
```

#### DB_USERNAME
```
Value: palantier_user
```

#### DB_PASSWORD
```
Value: palantier_password
```

---

### 4. JWT 관련 (1개)

#### JWT_SECRET
```
Value: your-256-bit-secret-key-change-this-in-production-please-make-it-long-enough
```

---

## Secrets 등록 체크리스트

- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] AWS_REGION
- [ ] AWS_S3_BUCKET_NAME
- [ ] AWS_S3_BUCKET_NAME_BACKEND
- [ ] AWS_CLOUDFRONT_DISTRIBUTION_ID
- [ ] EC2_HOST
- [ ] EC2_USER
- [ ] EC2_SSH_PRIVATE_KEY
- [ ] DB_HOST
- [ ] DB_PORT
- [ ] DB_NAME
- [ ] DB_USERNAME
- [ ] DB_PASSWORD
- [ ] JWT_SECRET

---

## 등록 완료 후

모든 Secrets 등록이 완료되면 GitHub Actions workflow가 자동으로 작동합니다:

1. **프론트엔드 변경 시** (`parantier-front/**`)
   - 자동 빌드 → S3 업로드 → CloudFront 캐시 무효화

2. **백엔드 변경 시** (`parantier-api/**`)
   - 자동 빌드 → EC2 배포 → 애플리케이션 재시작

---

## 문제 해결

### Secrets가 제대로 등록되었는지 확인
- GitHub Actions 실행 로그에서 `***` 로 마스킹된 값 확인
- 실제 값은 보이지 않지만, 참조는 `${{ secrets.SECRET_NAME }}` 형식으로 표시됨

### 배포 실패 시
1. Actions 탭에서 실패한 workflow 클릭
2. 각 step의 로그 확인
3. Secrets 값이 정확한지 재확인

---

## 보안 주의사항

⚠️ **절대 커밋하지 말 것:**
- AWS Access Key
- AWS Secret Key
- SSH Private Key
- Database Password
- JWT Secret

✅ **안전한 관리:**
- Secrets는 GitHub에서 암호화되어 저장됨
- Workflow 실행 시에만 복호화되어 사용됨
- 로그에는 `***`로 마스킹되어 표시됨
