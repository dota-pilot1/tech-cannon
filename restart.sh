#!/bin/bash
pkill -9 -f "java" || true
sleep 3
nohup java -jar /home/ubuntu/parantier-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod > /home/ubuntu/app.log 2>&1 &
echo "started pid: $!"
