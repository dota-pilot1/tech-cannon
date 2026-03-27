# WebSocket 채팅 기능 배포 가이드

## 개요

이슈별 실시간 채팅 기능이 구현되었습니다. Spring WebSocket과 STOMP 프로토콜을 사용하여 실시간 양방향 통신을 제공합니다.

**배포 일자**: 2026-03-27
**버전**: v1.0.0

---

## 기술 스택

### 백엔드
- **Spring WebSocket**: 웹소켓 서버 구현
- **STOMP Protocol**: 메시징 프로토콜
- **SimpleBrokerMessageHandler**: 인메모리 메시지 브로커
- **MyBatis**: 메시지 영속화
- **PostgreSQL**: 메시지 저장소

### 프론트엔드
- **@stomp/stompjs**: STOMP 클라이언트
- **sockjs-client**: WebSocket polyfill (SockJS 사용 안 함)
- **TanStack Query**: REST API 데이터 페칭 (과거 메시지)
- **React 19**: UI 구현

---

## 아키텍처

### 통신 흐름

```
1. 페이지 로드
   ↓
2. REST API로 과거 메시지 조회
   GET /api/issues/{issueId}/messages
   ↓
3. WebSocket 연결
   ws://localhost:8080/ws (개발)
   wss://api.dxline-tallent.com/ws (프로덕션)
   ↓
4. 특정 이슈 채팅방 구독
   SUBSCRIBE /topic/issues/{issueId}
   ↓
5. 메시지 전송
   SEND /app/issue/send
   ↓
6. 서버에서 메시지 브로드캐스트
   SEND /topic/issues/{issueId}
   ↓
7. 모든 구독자가 실시간으로 수신
```

### 데이터베이스 스키마

**테이블**: `issue_messages`

```sql
CREATE TABLE issue_messages (
    id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_issue_messages_issue_id ON issue_messages(issue_id);
CREATE INDEX idx_issue_messages_created_at ON issue_messages(created_at);
```

---

## 주요 구현 파일

### 백엔드

#### 1. WebSocket 설정
**파일**: `parantier-api/src/main/java/com/mapo/palantier/config/WebSocketConfig.java`

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }
}
```

**주요 설정**:
- 엔드포인트: `/ws`
- 브로커: `/topic` (SimpleBroker - 인메모리)
- 애플리케이션 프리픽스: `/app`
- CORS: 모든 오리진 허용 (프로덕션에서 제한 권장)

#### 2. WebSocket 컨트롤러
**파일**: `parantier-api/src/main/java/com/mapo/palantier/issue/websocket/IssueWebSocketController.java`

```java
@Controller
public class IssueWebSocketController {
    private final IssueMessageService issueMessageService;

    @MessageMapping("/issue/send")
    @SendTo("/topic/issues/{issueId}")
    public MessagePayload handleMessage(@Payload MessageRequest request) {
        // 1. DB에 저장
        IssueMessage saved = issueMessageService.createMessage(
            request.getIssueId(),
            request.getUserId(),
            request.getMessage()
        );

        // 2. 모든 구독자에게 브로드캐스트
        return MessagePayload.from(saved, request.getSenderName());
    }
}
```

**메시지 흐름**:
1. 클라이언트가 `/app/issue/send`로 메시지 전송
2. 서버가 DB에 저장 (MyBatis)
3. `@SendTo`로 `/topic/issues/{issueId}` 구독자 전체에게 브로드캐스트

#### 3. MyBatis 매퍼
**파일**: `parantier-api/src/main/resources/mybatis/mapper/IssueMessageMapper.xml`

**특징**: `useGeneratedKeys`로 자동 생성된 타임스탬프 반환

```xml
<insert id="insert" parameterType="com.mapo.palantier.issue.domain.IssueMessage"
        useGeneratedKeys="true" keyProperty="id,createdAt,updatedAt"
        keyColumn="id,created_at,updated_at">
    INSERT INTO issue_messages (
        issue_id,
        user_id,
        message,
        created_at,
        updated_at,
        is_deleted
    ) VALUES (
        #{issueId},
        #{userId},
        #{message},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        false
    )
</insert>
```

**중요**: `keyProperty`와 `keyColumn`을 통해 DB에서 생성된 `created_at`, `updated_at` 값을 반환받아 WebSocket 응답에 포함

### 프론트엔드

#### 1. WebSocket 훅
**파일**: `parantier-front/src/features/issue/hooks/useIssueChat.ts`

```typescript
export function useIssueChat({ issueId }: UseIssueChatOptions) {
  const [messages, setMessages] = useState<MessageWithUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const stompClientRef = useRef<Client | null>(null)

  useEffect(() => {
    const client = new Client({
      brokerURL: `${WS_URL}/ws`,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true)

        client.subscribe(`/topic/issues/${issueId}`, (message) => {
          const payload = JSON.parse(message.body)
          const newMessage: MessageWithUser = {
            id: payload.id,
            issueId: payload.issueId,
            userId: payload.userId,
            message: payload.message,
            createdAt: payload.createdAt,
            updatedAt: payload.updatedAt,
            username: payload.senderName,
            userEmail: '',
            isDeleted: false,
          }
          setMessages((prev) => [...prev, newMessage])
        })
      },
      onDisconnect: () => setIsConnected(false),
    })

    client.activate()
    stompClientRef.current = client

    return () => client.deactivate()
  }, [issueId])

  const sendMessage = (message: string, userId: number, username: string) => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/app/issue/send',
        body: JSON.stringify({
          issueId,
          userId,
          message,
          senderName: username,
        }),
      })
    }
  }

  return { messages, isConnected, sendMessage }
}
```

**특징**:
- 자동 재연결: 5초 간격
- Heartbeat: 4초 간격 (연결 유지)
- 구독: `/topic/issues/{issueId}`
- 발행: `/app/issue/send`

#### 2. 채팅 UI 컴포넌트
**파일**: `parantier-front/src/features/issue/components/ChatPanel.tsx`

```typescript
export function ChatPanel({ issueId }: ChatPanelProps) {
  // REST API: 과거 메시지 가져오기
  const { data: history = [], isLoading } = useIssueMessages(issueId)

  // WebSocket: 실시간 메시지
  const { messages: realtime, isConnected, sendMessage } = useIssueChat({ issueId })

  // 과거 + 실시간 메시지 합치기
  const allMessages = useMemo(() => {
    return [...history, ...realtime]
  }, [history, realtime])

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages])

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header: 연결 상태 표시 */}
      {/* Messages: 채팅 메시지 목록 */}
      {/* Input: 메시지 입력 (연결 끊기면 비활성화) */}
    </div>
  )
}
```

---

## 배포 시 주의사항

### 1. WebSocket 엔드포인트 설정

**프론트엔드 환경 변수**:

```typescript
// parantier-front/src/features/issue/hooks/useIssueChat.ts
const WS_URL = import.meta.env.VITE_API_URL?.replace('/api', '').replace('https://', 'wss://').replace('http://', 'ws://')
```

**환경별 URL**:
- 로컬 개발: `ws://localhost:8080/ws`
- 프로덕션: `wss://api.dxline-tallent.com/ws`

### 2. CORS 설정

**백엔드 WebSocketConfig.java**:

```java
registry.addEndpoint("/ws")
        .setAllowedOriginPatterns("*"); // 프로덕션에서는 특정 도메인만 허용 권장
```

**프로덕션 권장 설정**:

```java
registry.addEndpoint("/ws")
        .setAllowedOrigins(
            "https://dxline-tallent.com",
            "https://d1841s1y3ps0cj.cloudfront.net",
            "http://localhost:5173"
        );
```

### 3. Nginx/ALB 설정 (WebSocket 프록시)

WebSocket을 리버스 프록시 뒤에서 사용하는 경우 추가 설정 필요:

```nginx
location /ws {
    proxy_pass http://localhost:8080/ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
}
```

### 4. 메모리 고려사항

SimpleBroker는 인메모리 방식이므로:
- 서버 재시작 시 실시간 메시지 연결 끊김
- 다중 서버 환경에서는 Redis 또는 RabbitMQ 브로커 사용 권장
- 현재는 단일 서버 환경이므로 SimpleBroker로 충분

---

## 테스트 방법

### 1. 로컬 테스트

**백엔드 시작**:
```bash
cd parantier-api
./gradlew bootRun
```

**프론트엔드 시작**:
```bash
cd parantier-front
npm run dev
```

**테스트 절차**:
1. 브라우저 2개 또는 시크릿 모드로 동시 로그인
2. 동일한 이슈 페이지 접속
3. 한쪽에서 메시지 전송
4. 다른 쪽에서 실시간으로 표시되는지 확인

### 2. 프로덕션 테스트

**URL**: https://dxline-tallent.com/issues/{issueId}

**확인 사항**:
- [ ] WebSocket 연결 성공 (헤더에 "연결됨" 표시)
- [ ] 메시지 전송 가능
- [ ] 다른 사용자가 전송한 메시지 실시간 수신
- [ ] 페이지 새로고침 후 과거 메시지 표시
- [ ] 브라우저 개발자 도구 WebSocket 탭에서 연결 확인

### 3. 로그 확인

**백엔드 로그** (WebSocket 연결 확인):

```bash
ssh -i "/Users/terecal/mapo-palantier-project/배포 가이드/hibot-d-server-key.pem" ubuntu@43.200.241.26
tail -f /home/ubuntu/app.log | grep -i "websocket\|stomp"
```

**예상 로그**:
```
INFO --- SimpleBrokerMessageHandler: Starting...
INFO --- SimpleBrokerMessageHandler: BrokerAvailabilityEvent[available=true]
INFO --- SimpleBrokerMessageHandler: Started.
```

---

## 트러블슈팅

### 문제 1: WebSocket 연결 실패

**증상**: 프론트엔드에서 "연결 중..." 상태에서 멈춤

**원인**:
- 백엔드가 실행 중이지 않음
- CORS 설정 문제
- 방화벽/보안그룹에서 WebSocket 포트 차단

**해결**:
1. 백엔드 헬스체크: `curl http://43.200.241.26:8080/actuator/health`
2. 브라우저 개발자 도구 콘솔 확인
3. 백엔드 로그 확인: `tail -f /home/ubuntu/app.log`

### 문제 2: 메시지 전송 후 응답 없음

**증상**: 메시지 입력 후 UI에 표시되지 않음

**원인**:
- DB 저장 실패
- MyBatis 매퍼 설정 오류
- WebSocket 구독 경로 불일치

**해결**:
1. 백엔드 로그에서 예외 확인
2. DB에 메시지가 저장되었는지 확인:
   ```sql
   SELECT * FROM issue_messages WHERE issue_id = {issueId} ORDER BY created_at DESC LIMIT 10;
   ```
3. 프론트엔드 콘솔에서 WebSocket 프레임 확인

### 문제 3: 과거 메시지 로드 실패

**증상**: 채팅창에 과거 메시지가 표시되지 않음

**원인**:
- REST API 엔드포인트 오류
- 권한 문제 (로그인되지 않음)

**해결**:
1. API 호출 확인:
   ```bash
   curl -H "Authorization: Bearer {token}" \
        https://api.dxline-tallent.com/api/issues/{issueId}/messages
   ```
2. 브라우저 Network 탭에서 응답 확인
3. 백엔드 SecurityConfig에서 권한 설정 확인

---

## 향후 개선 사항

### 1. 메시지 기능 확장
- [ ] 메시지 수정/삭제 기능
- [ ] 파일 첨부 기능
- [ ] @멘션 기능
- [ ] 읽음 표시 기능

### 2. 성능 최적화
- [ ] 무한 스크롤 (과거 메시지 페이징)
- [ ] Redis 브로커 도입 (다중 서버 지원)
- [ ] WebSocket 메시지 압축

### 3. 보안 강화
- [ ] WebSocket 연결 시 JWT 토큰 검증
- [ ] 메시지 XSS 방지 처리
- [ ] Rate limiting (메시지 전송 제한)

### 4. 모니터링
- [ ] WebSocket 연결 수 모니터링
- [ ] 메시지 전송 실패율 추적
- [ ] 평균 응답 시간 측정

---

## 참고 자료

- **Spring WebSocket Documentation**: https://docs.spring.io/spring-framework/reference/web/websocket.html
- **STOMP Protocol**: https://stomp.github.io/
- **@stomp/stompjs**: https://github.com/stomp-js/stompjs

---

**마지막 업데이트**: 2026-03-27
**작성자**: Claude Code
