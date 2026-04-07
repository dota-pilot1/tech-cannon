# 해커톤 기능

## 구현 현황 (Phase 1~3 완료)

- 라우트: `/hackathon` (메뉴 id: 55, HEADER 타입)
- 프론트: `parantier-front/src/features/hackathon/`
- 백엔드: `parantier-api/src/main/java/com/mapo/palantier/hackathon/`

## DB 테이블

| 테이블 | 설명 |
|--------|------|
| `hackathon_events` | 이벤트 (is_active로 현재 이벤트 구분) |
| `hackathon_teams` | 팀 (color_theme: blue/emerald/violet) |
| `hackathon_team_members` | 팀 멤버 |
| `hackathon_chat_messages` | 오픈 채팅 메시지 |
| `hackathon_team_links` | 링크 (figma/github/custom) |
| `hackathon_team_tasks` | Task (TODO/DOING/DONE) |
| `hackathon_team_issues` | 이슈 (priority: HIGH/MEDIUM/LOW) |
| `hackathon_team_faq` | Q&A |

## API 엔드포인트

```
GET  /api/hackathon/events/active
GET  /api/hackathon/events
POST /api/hackathon/events                   (ADMIN)
PUT  /api/hackathon/events/{id}              (ADMIN)

GET  /api/hackathon/events/{eventId}/chat
WS   hackathon-chat/{eventId}

GET/POST        /api/hackathon/teams/{teamId}/links
DELETE          /api/hackathon/teams/{teamId}/links/{linkId}
GET/POST        /api/hackathon/teams/{teamId}/tasks
PUT/DELETE      /api/hackathon/teams/{teamId}/tasks/{taskId}
GET/POST        /api/hackathon/teams/{teamId}/issues
PUT             /api/hackathon/teams/{teamId}/issues/{issueId}
GET/POST        /api/hackathon/teams/{teamId}/faq
PUT/DELETE      /api/hackathon/teams/{teamId}/faq/{faqId}
POST/DELETE     /api/hackathon/teams/{teamId}/members/{userId}
```

## 초기 데이터 등록

```bash
# 이벤트 생성
docker exec -i palantier-postgres psql -U palantier_user -d palantier -c \
  "INSERT INTO hackathon_events (title, description, start_at, end_at, max_teams, is_active)
   VALUES ('2024 사내 해커톤', '48시간 해커톤', NOW(), NOW() + INTERVAL '48 hours', 2, true);"

# 팀 생성
docker exec -i palantier-postgres psql -U palantier_user -d palantier -c \
  "INSERT INTO hackathon_teams (event_id, name, project, color_theme, order_num)
   VALUES (1, 'Team A', 'AI 코드 리뷰', 'blue', 0),
          (1, 'Team B', '실시간 협업', 'emerald', 1);"
```

## WebSocket 채팅 메시지 포맷

```json
{ "type": "SUBSCRIBE", "topic": "hackathon-chat/1", "data": {} }
{ "type": "CHAT", "topic": "hackathon-chat/1", "data": {
    "senderId": 1, "senderName": "홍길동",
    "message": "안녕!", "eventId": 1
  }
}
```
