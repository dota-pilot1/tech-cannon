#!/bin/bash
set -e

echo "🚀 프론트엔드 배포 시작..."

# 1. 빌드
echo "📦 빌드 중..."
npm run build

# 2. S3 업로드
echo "☁️  S3 업로드 중..."
aws s3 sync dist s3://dxline-tallent-front --delete

# 3. CloudFront 캐시 무효화
echo "🔄 CloudFront 캐시 무효화 중..."
aws cloudfront create-invalidation --distribution-id E11NF3HMOB52NI --paths "/*"

echo "✅ 프론트엔드 배포 완료!"
echo "🌐 https://dxline-tallent.com"
