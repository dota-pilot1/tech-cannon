# WebSocket 구현 원칙

## ❌ 사용 금지

```
@stomp/stompjs, SimpMessagingTemplate,
@EnableWebSocketMessageBroker, @MessageMapping
```

## ✅ 사용 방식

- **백엔드**: `@EnableWebSocket` + `TextWebSocketHandler`
- **프론트**: 브라우저 기본 `new WebSocket(url)`

## 메시지 포맷

```json
{
  "type": "SUBSCRIBE|CHAT|JOIN|LEAVE|PARTICIPANTS",
  "topic": "meeting/1",
  "data": {}
}
```

## 공통 훅

```typescript
import { usePureWebSocket } from '@/shared/hooks/usePureWebSocket'
```

## 토픽 구조

| 토픽 | 설명 |
|------|------|
| `meeting/{channelId}` | 미팅 채팅 |
| `hackathon-chat/{eventId}` | 해커톤 오픈 채팅 |
