# WebSocket 채팅 기능

## 엔드포인트

- **WebSocket 연결**: `ws://localhost:8080/ws` (로컬), `wss://api.dxline-tallent.com/ws` (프로덕션)
- **구독**: `/topic/issues/{issueId}`
- **발행**: `/app/issue/send`
- **REST API (과거 메시지)**: `GET /api/issues/{issueId}/messages`

## 주요 파일

### 백엔드
- **설정**: `parantier-api/src/main/java/com/mapo/palantier/config/WebSocketConfig.java`
- **컨트롤러**: `parantier-api/src/main/java/com/mapo/palantier/issue/websocket/IssueWebSocketController.java`
- **MyBatis**: `parantier-api/src/main/resources/mybatis/mapper/IssueMessageMapper.xml`

### 프론트엔드
- **훅**: `parantier-front/src/features/issue/hooks/useIssueChat.ts`
- **UI**: `parantier-front/src/features/issue/components/ChatPanel.tsx`

## 테스트

### 배포 확인
```bash
# 브라우저
https://dxline-tallent.com/issues/{issueId}

# 로그 확인
ssh -i "/Users/terecal/mapo-palantier-project/배포 가이드/hibot-d-server-key.pem" ubuntu@43.200.241.26 \
  "tail -30 /home/ubuntu/app.log | grep -i 'websocket\|stomp\|broker'"
```

### 체크리스트
- [ ] WebSocket 연결 성공 (UI에 "연결됨" 표시)
- [ ] 메시지 전송 가능
- [ ] 다른 사용자가 전송한 메시지 실시간 수신
- [ ] 페이지 새로고침 후 과거 메시지 로드

## 트러블슈팅

### WebSocket 연결 실패
1. 백엔드 헬스체크: `curl https://api.dxline-tallent.com/actuator/health`
2. 브라우저 개발자 도구 콘솔 확인
3. 백엔드 로그 확인: `tail -f /home/ubuntu/app.log`

### 메시지 전송 후 응답 없음
1. 백엔드 로그에서 예외 확인
2. DB 확인:
```sql
SELECT * FROM issue_messages WHERE issue_id = {issueId} ORDER BY created_at DESC LIMIT 10;
```

---

**마지막 업데이트**: 2026-04-25
