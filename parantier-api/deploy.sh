#!/bin/bash
set -e

PEM_FILE="../배포 가이드/hibot-d-server-key.pem"
EC2_HOST="ubuntu@43.200.241.26"
JAR_FILE="build/libs/parantier-api-0.0.1-SNAPSHOT.jar"

echo "🚀 백엔드 배포 시작..."

# 1. 빌드
echo "📦 빌드 중..."
./gradlew clean bootJar

# 2. EC2에 업로드
echo "☁️  EC2 업로드 중..."
scp -i "$PEM_FILE" "$JAR_FILE" "$EC2_HOST:/home/ubuntu/"

# 3. 기존 프로세스 종료
echo "🛑 기존 프로세스 종료 중..."
ssh -i "$PEM_FILE" "$EC2_HOST" "pkill -f 'java -jar parantier-api' || true"

# 4. 새 애플리케이션 시작
echo "▶️  새 애플리케이션 시작 중..."
ssh -i "$PEM_FILE" "$EC2_HOST" \
    "nohup java -jar /home/ubuntu/parantier-api-0.0.1-SNAPSHOT.jar \
    --spring.profiles.active=prod \
    > /home/ubuntu/app.log 2>&1 &"

# 5. 헬스체크 대기
echo "⏳ 애플리케이션 시작 대기 중 (15초)..."
sleep 15

# 6. 헬스체크
echo "🏥 헬스체크 중..."
HEALTH=$(curl -s http://43.200.241.26:8080/actuator/health)
echo "$HEALTH"

if echo "$HEALTH" | grep -q '"status":"UP"'; then
    echo "✅ 백엔드 배포 완료!"
    echo "🌐 https://api.dxline-tallent.com"
else
    echo "❌ 배포 실패! 로그를 확인하세요."
    ssh -i "$PEM_FILE" "$EC2_HOST" "tail -50 /home/ubuntu/app.log"
    exit 1
fi
