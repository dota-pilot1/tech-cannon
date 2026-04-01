#!/bin/bash
pkill -f parantier-api || true
sleep 2
nohup java -jar /home/ubuntu/parantier-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod > /home/ubuntu/app.log 2>&1 &
echo "백엔드 시작 완료"
