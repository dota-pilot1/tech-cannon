# 채팅방 구현 Step 1: WebSocket 기본 설정 및 실시간 메시지

## 목표
실시간 채팅 기능의 핵심인 WebSocket 기본 설정과 메시지 송수신을 구현합니다.

## 구현 체크리스트

### 1. Backend: Spring WebSocket 설정
- [ ] `build.gradle`에 WebSocket 의존성 추가
  ```gradle
  implementation 'org.springframework.boot:spring-boot-starter-websocket'
  ```
- [ ] WebSocketConfig 클래스 생성
  - STOMP 엔드포인트 설정 (`/ws`)
  - 메시지 브로커 설정 (`/topic`, `/queue`)
  - CORS 설정

### 2. DB 스키마 설계 및 생성
**Docker PostgreSQL에 직접 실행**

#### chat_rooms 테이블
```sql
CREATE TABLE chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    room_type VARCHAR(50) NOT NULL, -- 'TEAM', 'PROJECT', 'DIRECT'
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

#### messages 테이블
```sql
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT REFERENCES chat_rooms(id),
    sender_id BIGINT REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'TEXT', -- 'TEXT', 'FILE', 'IMAGE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### room_members 테이블
```sql
CREATE TABLE room_members (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT REFERENCES chat_rooms(id),
    user_id BIGINT REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    UNIQUE(room_id, user_id)
);
```

### 3. Backend: 실시간 메시지 WebSocket Controller
- [ ] `ChatController` 생성
  - `@MessageMapping("/chat.send")` - 메시지 전송
  - `@SendTo("/topic/messages")` - 브로드캐스트
- [ ] 메시지 DTO 생성 (ChatMessage)

### 4. DB: 채팅 메뉴 추가
```sql
INSERT INTO menus (name, parent_id, menu_type, icon, path, order_num, is_active)
VALUES ('채팅', NULL, 'PAGE', 'MessageSquare', '/chat', 5, TRUE);
```

### 5. Frontend: 라우트 설정
- [ ] `src/routes/chat/` 디렉토리 생성
- [ ] `src/routes/chat/index.tsx` 기본 페이지 생성
- [ ] 라우터 라우트 추가

### 6. Frontend: WebSocket 클라이언트
- [ ] `@stomp/stompjs` 패키지 설치
  ```bash
  npm install @stomp/stompjs
  ```
- [ ] WebSocket 연결 훅 생성
  - 연결 URL: `ws://localhost:8080/ws`
  - 구독: `/topic/messages`
  - 발행: `/app/chat.send`

### 7. Frontend: 기본 채팅 UI
- [ ] 채팅 메시지 목록 컴포넌트
- [ ] 메시지 입력 폼
- [ ] 전송 버튼
- [ ] 연결 상태 표시

### 8. 테스트
- [ ] Backend 서버 실행 확인
- [ ] Frontend 연결 확인
- [ ] 메시지 전송 테스트
- [ ] 메시지 수신 테스트
- [ ] 연결 끊김/재연결 테스트 (나중에 Step 2)

## 기술 스택
- **Backend**: Spring Boot + Spring WebSocket + STOMP
- **Frontend**: React + @stomp/stompjs
- **DB**: PostgreSQL (Docker)

### 8. 주의사항
- Flyway 마이그레이션 사용하지 않음
- 모든 DB 스키마는 Docker 컨테이너에 직접 SQL 실행
- 보안/인증은 나중 단계에서 추가 (지금은 기본 기능만 테스트)

## 다음 단계 확인
Step 1 완료 후 다음은 메시지 저장과 기본 기능 확인 테스트

## 후속 작업 (Step 2)
- 채팅방 CRUD API 구현
- 채팅방 목록 UI
- 채팅방별 메시지 필터링
- JWT 인증 연동
