#!/bin/bash
set -e

PROJECT_ROOT="/Users/terecal/mapo-palantier-project"
PEM="/Users/terecal/mapo-palantier-project/docs-hyun/배포 가이드/hibot-d-server-key.pem"
EC2_HOST="ubuntu@43.200.241.26"

echo "=========================================="
echo "  Palantier 전체 배포 시작"
echo "=========================================="
echo ""

# 프론트엔드 배포
echo "📦 [1/4] 프론트엔드 빌드 중..."
cd "$PROJECT_ROOT/parantier-front"
npm run build

echo "☁️  [2/4] S3 업로드 중..."
aws s3 sync dist s3://dxline-tallent-front --delete

echo "🔄 [3/4] CloudFront 캐시 무효화 중..."
aws cloudfront create-invalidation --distribution-id E11NF3HMOB52NI --paths "/*" > /dev/null

echo "✅ 프론트엔드 배포 완료!"
echo ""

# 백엔드 배포
echo "📦 [4/4] 백엔드 빌드 중..."
cd "$PROJECT_ROOT/parantier-api"
./gradlew clean bootJar

echo "📝 시작 스크립트 생성 중..."

# .env 파일에서 AWS 자격증명 로드
if [ -f "$PROJECT_ROOT/parantier-api/.env" ]; then
  source "$PROJECT_ROOT/parantier-api/.env"
else
  echo "⚠️  .env 파일을 찾을 수 없습니다. AWS 자격증명을 수동으로 설정하세요."
  exit 1
fi

cat > /tmp/start-backend.sh << EOF
#!/bin/bash
pkill -f 'java -jar' || true
sleep 2

export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
export AWS_S3_BUCKET_NAME=$AWS_S3_BUCKET_NAME
export AWS_S3_REGION=$AWS_S3_REGION
export OPENAI_API_KEY=$OPENAI_API_KEY

nohup java -jar /home/ubuntu/parantier-api-0.0.1-SNAPSHOT.jar \
    --spring.profiles.active=prod \
    > /home/ubuntu/app.log 2>&1 &

echo "Application started. PID: \$!"
EOF
chmod +x /tmp/start-backend.sh

echo "☁️  EC2 업로드 중..."
scp -i "$PEM" build/libs/parantier-api-0.0.1-SNAPSHOT.jar "$EC2_HOST:/home/ubuntu/"
scp -i "$PEM" /tmp/start-backend.sh "$EC2_HOST:/home/ubuntu/"

echo "▶️  백엔드 시작 중..."
ssh -i "$PEM" "$EC2_HOST" "bash /home/ubuntu/start-backend.sh"

echo "⏳ 애플리케이션 시작 대기 중 (10초)..."
sleep 10

echo "🏥 헬스체크 중..."
HEALTH=$(curl -s http://43.200.241.26:8080/actuator/health)
echo "$HEALTH"

if echo "$HEALTH" | grep -q '"status":"UP"'; then
    echo "✅ 백엔드 배포 완료!"
else
    echo "❌ 백엔드 헬스체크 실패!"
    ssh -i "$PEM" "$EC2_HOST" "tail -30 /home/ubuntu/app.log"
    exit 1
fi

echo ""
echo "=========================================="
echo "  전체 배포 완료!"
echo "=========================================="
echo ""
echo "🌐 프론트엔드: https://dxline-tallent.com"
echo "🌐 백엔드: https://api.dxline-tallent.com"
echo "🏥 헬스체크: http://43.200.241.26:8080/actuator/health"
echo ""
