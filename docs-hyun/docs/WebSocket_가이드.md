# WebSocket 구현 가이드

## 개요

이 문서는 Palantier 프로젝트에서 실시간 업무 현황 페이지를 구현하기 위한 WebSocket 기본기를 다룹니다.

## WebSocket이란?

WebSocket은 클라이언트와 서버 간 **양방향 실시간 통신**을 위한 프로토콜입니다.

### HTTP vs WebSocket

| 특징 | HTTP | WebSocket |
|------|------|-----------|
| 통신 방식 | 요청-응답 (단방향) | 양방향 |
| 연결 유지 | 매 요청마다 새 연결 | 한 번 연결 후 유지 |
| 실시간성 | 폴링 필요 (비효율) | 실시간 푸시 가능 |
| 오버헤드 | 헤더가 큼 | 헤더가 작음 |
| 사용 사례 | 일반 API 호출 | 채팅, 알림, 실시간 대시보드 |

## 기술 스택

### Backend (Spring Boot)

- **Spring WebSocket**: WebSocket 지원
- **STOMP**: 메시징 프로토콜 (Simple Text Oriented Messaging Protocol)
- **SockJS**: WebSocket 미지원 브라우저를 위한 폴백

### Frontend (React)

- **SockJS Client**: SockJS 클라이언트
- **@stomp/stompjs**: STOMP 프로토콜 클라이언트
- **TanStack Query**: 서버 상태 관리 (REST API와 병행)

## 프로젝트 구조

```
parantier-api/
├── src/main/java/com/mapo/palantier/
│   ├── config/
│   │   └── WebSocketConfig.java          # WebSocket 설정
│   ├── websocket/
│   │   ├── controller/
│   │   │   └── NotificationController.java  # 메시지 컨트롤러
│   │   ├── model/
│   │   │   └── NotificationMessage.java     # 메시지 DTO
│   │   └── service/
│   │       └── NotificationService.java     # 메시지 전송 서비스

parantier-front/
├── src/
│   ├── shared/
│   │   ├── lib/
│   │   │   └── websocket.ts              # WebSocket 유틸리티
│   │   └── hooks/
│   │       └── useWebSocket.ts           # WebSocket 훅
│   └── pages/
│       └── status/
│           └── StatusPage.tsx            # 실시간 현황 페이지
```

---

## Backend 구현

### 1. 의존성 추가

`parantier-api/build.gradle`:

```gradle
dependencies {
    // WebSocket
    implementation 'org.springframework.boot:spring-boot-starter-websocket'

    // 기존 의존성...
}
```

### 2. WebSocket 설정

`WebSocketConfig.java`:

```java
package com.mapo.palantier.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 클라이언트가 구독할 prefix
        config.enableSimpleBroker("/topic", "/queue");

        // 클라이언트가 메시지를 보낼 prefix
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // CORS 설정
                .withSockJS();  // SockJS 폴백 지원
    }
}
```

**주요 개념**:
- `/topic`: 1:N (브로드캐스트) - 모든 구독자에게 메시지 전송
- `/queue`: 1:1 (개인) - 특정 사용자에게만 메시지 전송
- `/app`: 클라이언트 → 서버로 메시지 보낼 때 사용

### 3. 메시지 DTO

`NotificationMessage.java`:

```java
package com.mapo.palantier.websocket.model;

public class NotificationMessage {
    private String type;        // 메시지 타입 (ISSUE_CREATED, ISSUE_UPDATED 등)
    private String message;     // 메시지 내용
    private Object data;        // 추가 데이터
    private String timestamp;   // 발생 시각

    // Getters, Setters, Constructors
    public NotificationMessage() {}

    public NotificationMessage(String type, String message, Object data) {
        this.type = type;
        this.message = message;
        this.data = data;
        this.timestamp = java.time.Instant.now().toString();
    }

    // Getters/Setters...
}
```

### 4. WebSocket 컨트롤러

`NotificationController.java`:

```java
package com.mapo.palantier.websocket.controller;

import com.mapo.palantier.websocket.model.NotificationMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class NotificationController {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 클라이언트가 /app/send로 메시지를 보내면
     * /topic/notifications를 구독한 모든 클라이언트에게 전달
     */
    @MessageMapping("/send")
    @SendTo("/topic/notifications")
    public NotificationMessage sendNotification(NotificationMessage message) {
        return message;
    }

    /**
     * 서버 코드에서 직접 메시지 전송
     */
    public void sendToAll(NotificationMessage message) {
        messagingTemplate.convertAndSend("/topic/notifications", message);
    }

    /**
     * 특정 사용자에게만 메시지 전송
     */
    public void sendToUser(String userId, NotificationMessage message) {
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", message);
    }
}
```

### 5. 비즈니스 로직에서 알림 전송

예: 이슈 생성 시 알림

`IssueService.java` (예시):

```java
@Service
public class IssueService {

    private final NotificationController notificationController;

    public IssueService(NotificationController notificationController) {
        this.notificationController = notificationController;
    }

    public Issue createIssue(CreateIssueRequest request) {
        // 이슈 생성 로직...
        Issue issue = issueMapper.insert(request);

        // WebSocket으로 실시간 알림 전송
        NotificationMessage notification = new NotificationMessage(
            "ISSUE_CREATED",
            "새 이슈가 생성되었습니다: " + issue.getTitle(),
            issue
        );
        notificationController.sendToAll(notification);

        return issue;
    }
}
```

---

## Frontend 구현

### 1. 의존성 설치

```bash
cd parantier-front
npm install sockjs-client @stomp/stompjs
```

### 2. WebSocket 유틸리티

`src/shared/lib/websocket.ts`:

```typescript
import SockJS from 'sockjs-client'
import { Client, IMessage, StompSubscription } from '@stomp/stompjs'

const WS_URL = import.meta.env.VITE_API_URL?.replace('/api', '/ws') || 'http://localhost:8080/ws'

export class WebSocketClient {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()

  constructor() {
    this.connect()
  }

  private connect() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000, // 재연결 대기 시간
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('[WebSocket]', str)
      },
      onConnect: () => {
        console.log('✅ WebSocket 연결 성공')
      },
      onDisconnect: () => {
        console.log('❌ WebSocket 연결 해제')
      },
      onStompError: (frame) => {
        console.error('❌ WebSocket 에러:', frame.headers['message'])
      },
    })

    this.client.activate()
  }

  /**
   * 토픽 구독
   */
  subscribe(destination: string, callback: (message: any) => void): string {
    if (!this.client) {
      throw new Error('WebSocket 클라이언트가 초기화되지 않았습니다.')
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      const body = JSON.parse(message.body)
      callback(body)
    })

    const subscriptionId = `${destination}-${Date.now()}`
    this.subscriptions.set(subscriptionId, subscription)

    return subscriptionId
  }

  /**
   * 구독 취소
   */
  unsubscribe(subscriptionId: string) {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(subscriptionId)
    }
  }

  /**
   * 메시지 전송
   */
  send(destination: string, body: any) {
    if (!this.client || !this.client.connected) {
      throw new Error('WebSocket이 연결되지 않았습니다.')
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    })
  }

  /**
   * 연결 해제
   */
  disconnect() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe())
    this.subscriptions.clear()

    if (this.client) {
      this.client.deactivate()
    }
  }
}

// 싱글톤 인스턴스
export const wsClient = new WebSocketClient()
```

### 3. React Hook

`src/shared/hooks/useWebSocket.ts`:

```typescript
import { useEffect, useState } from 'react'
import { wsClient } from '@/shared/lib/websocket'

export interface WebSocketMessage {
  type: string
  message: string
  data: any
  timestamp: string
}

export function useWebSocket(topic: string) {
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    let subscriptionId: string | null = null

    try {
      subscriptionId = wsClient.subscribe(topic, (message: WebSocketMessage) => {
        console.log('📨 메시지 수신:', message)
        setMessages((prev) => [...prev, message])
      })

      setConnected(true)
    } catch (error) {
      console.error('WebSocket 구독 실패:', error)
      setConnected(false)
    }

    return () => {
      if (subscriptionId) {
        wsClient.unsubscribe(subscriptionId)
      }
    }
  }, [topic])

  const sendMessage = (destination: string, body: any) => {
    try {
      wsClient.send(destination, body)
    } catch (error) {
      console.error('메시지 전송 실패:', error)
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  return {
    messages,
    connected,
    sendMessage,
    clearMessages,
  }
}
```

### 4. 실시간 현황 페이지

`src/pages/status/StatusPage.tsx`:

```typescript
import { useWebSocket } from '@/shared/hooks/useWebSocket'
import { Badge } from '@/shared/ui/badge'
import { Card } from '@/shared/ui/card'

export function StatusPage() {
  const { messages, connected } = useWebSocket('/topic/notifications')

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">실시간 업무 현황</h1>
        <Badge variant={connected ? 'default' : 'destructive'}>
          {connected ? '🟢 연결됨' : '🔴 연결 끊김'}
        </Badge>
      </div>

      <div className="space-y-2">
        {messages.map((msg, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="mb-2">{msg.type}</Badge>
                <p className="text-sm">{msg.message}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(msg.timestamp).toLocaleTimeString('ko-KR')}
              </span>
            </div>
          </Card>
        ))}

        {messages.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            아직 알림이 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 주요 개념 정리

### 1. STOMP 프로토콜

STOMP (Simple Text Oriented Messaging Protocol)는 메시징 프로토콜로, WebSocket 위에서 동작합니다.

**프레임 구조**:
```
COMMAND
header1:value1
header2:value2

Body^@
```

**주요 명령어**:
- `CONNECT`: 연결
- `SUBSCRIBE`: 구독
- `SEND`: 메시지 전송
- `MESSAGE`: 메시지 수신
- `DISCONNECT`: 연결 해제

### 2. Destination 패턴

| Prefix | 용도 | 예시 |
|--------|------|------|
| `/topic/` | 브로드캐스트 (1:N) | `/topic/notifications` |
| `/queue/` | 개인 메시지 (1:1) | `/queue/user/{userId}` |
| `/app/` | 클라이언트 → 서버 | `/app/send` |

### 3. SockJS Fallback

WebSocket을 지원하지 않는 환경에서는 다음 순서로 폴백:
1. WebSocket
2. HTTP Streaming
3. HTTP Long Polling
4. HTTP Polling

---

## 테스트 방법

### 1. 간단한 테스트 페이지

브라우저 콘솔에서 테스트:

```javascript
// WebSocket 연결
const socket = new SockJS('http://localhost:8080/ws')
const client = new StompJs.Client({ webSocketFactory: () => socket })

client.onConnect = () => {
  console.log('연결 성공!')

  // 구독
  client.subscribe('/topic/notifications', (message) => {
    console.log('메시지 수신:', JSON.parse(message.body))
  })

  // 메시지 전송
  client.publish({
    destination: '/app/send',
    body: JSON.stringify({
      type: 'TEST',
      message: '테스트 메시지',
      data: { test: true }
    })
  })
}

client.activate()
```

### 2. Postman으로 테스트

Postman에서 WebSocket 연결:
1. New → WebSocket Request
2. URL: `ws://localhost:8080/ws`
3. Connect 후 메시지 전송/수신

---

## 보안 고려사항

### 1. 인증/인가

```java
@Configuration
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                    message, StompHeaderAccessor.class
                );

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // JWT 토큰 검증
                    String token = accessor.getFirstNativeHeader("Authorization");
                    // 토큰 검증 로직...
                }

                return message;
            }
        });
    }
}
```

### 2. CORS 설정

프로덕션 환경에서는 `.setAllowedOrigins("https://dxline-tallent.com")` 처럼 명시적으로 지정.

---

## 성능 최적화

### 1. 메시지 크기 최소화

불필요한 데이터는 제외하고 필요한 정보만 전송.

### 2. 메시지 배칭

짧은 시간에 여러 메시지가 발생하면 배치로 묶어서 전송.

### 3. 연결 풀 관리

동시 연결 수 제한 및 유휴 연결 정리.

---

## 다음 단계

1. ✅ 기본 WebSocket 설정 및 테스트
2. ⏳ 실시간 이슈 알림 구현
3. ⏳ 업무 현황 대시보드 구현
4. ⏳ 채팅 기능 구현 (선택)
5. ⏳ 알림 히스토리 저장 (선택)

---

**작성일**: 2026-03-27
**작성자**: Claude Code
