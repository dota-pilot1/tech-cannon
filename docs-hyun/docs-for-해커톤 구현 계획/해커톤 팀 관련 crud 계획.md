# 해커톤 팀 CRUD 구현 계획

## 목표
팀 카드 전체를 ADMIN이 동적으로 관리할 수 있게 하여,
해커톤 페이지 자체가 완전한 해커톤 운영 툴이 되도록 한다.

---

## 현재 상태
- Team A / Team B가 DB에 직접 INSERT된 고정 데이터
- 팀 수정/삭제/추가 불가
- 상단 요약 카드 (팀 수, 인원, 시간, 채팅) → 구현 예정 처리

---

## 구현 범위

### Phase 1 - 팀 CRUD (ADMIN)

#### 팀 추가
- 팀 카드들 오른쪽에 ADMIN 전용 `+ 팀 추가` 카드 버튼
- 클릭 시 팀 생성 다이얼로그 오픈
  - 팀 이름 (필수)
  - 프로젝트명 (선택)
  - 색상 테마 선택: blue / emerald / violet / rose / amber

#### 팀 수정
- 각 팀 카드 헤더 우상단에 ADMIN 전용 ✏️ 버튼
- 클릭 시 팀 수정 다이얼로그 오픈
  - 이름, 프로젝트명, 색상 테마 수정 가능

#### 팀 삭제
- 팀 수정 다이얼로그 내부 하단에 삭제 버튼 (destructive)
- 삭제 시 confirm 확인 → 팀 + 하위 데이터 전부 cascade 삭제

---

### Phase 2 - 상단 모니터링 카드 실데이터 연동

팀 CRUD 완성 후 상단 카드들을 실제 데이터로 교체:

| 카드 | 데이터 소스 | 비고 |
|------|------------|------|
| 참가 팀 | `teams.length` | 이미 있음 |
| 참가 인원 | `teams.reduce(members)` | 이미 있음 |
| 남은 시간 | `useCountdown(event.endAt)` | 이미 있음 |
| 채팅 | `messages.length` | 이미 있음 |

→ 팀 관리가 정착되면 4개 카드 한 번에 실데이터로 복원

---

## 백엔드 구현

### 이미 존재하는 API (미구현 상태)
```
POST /api/hackathon/events/{eventId}/teams   — 팀 생성 (ADMIN)
PUT  /api/hackathon/teams/{id}               — 팀 수정 (ADMIN)
```
→ `HackathonEventController`에 추가 필요

### 추가 필요
```
DELETE /api/hackathon/teams/{id}             — 팀 삭제 (ADMIN, cascade)
```

### DB
- `hackathon_teams` 테이블 이미 존재
- `CASCADE DELETE` 이미 설정됨 (팀 삭제 시 멤버/링크/Task/Issue/FAQ 전부 삭제)

---

## 프론트엔드 구현

### API (`hackathonApi.ts` 추가)
```typescript
createTeam: (eventId: number, req: CreateTeamRequest) => ...
updateTeam: (teamId: number, req: UpdateTeamRequest) => ...
deleteTeam: (teamId: number) => ...
```

### 훅 (`useHackathon.ts` 추가)
```typescript
useCreateTeam(eventId)  → invalidate hackathon-event-active
useUpdateTeam()         → invalidate hackathon-event-active
useDeleteTeam()         → invalidate hackathon-event-active
```

### UI
```
HackathonPage
├── 팀 카드들 (기존)
│   └── [ADMIN] 헤더 우상단 ✏️ 버튼 → 팀 수정/삭제 다이얼로그
└── [ADMIN] + 팀 추가 카드 (팀 카드 오른쪽에 점선 카드 형태)
    └── 클릭 → 팀 생성 다이얼로그
```

### 색상 테마 선택 UI
```
● blue    ● emerald    ● violet    ● rose    ● amber
```
클릭으로 선택, 선택된 색상은 팀 카드 미리보기 색으로 표시

---

## 구현 우선순위

| 순서 | 작업 | 예상 공수 |
|------|------|---------|
| 1 | 백엔드 createTeam / updateTeam / deleteTeam API | 1h |
| 2 | 프론트 API + 훅 추가 | 0.5h |
| 3 | 팀 추가 다이얼로그 + 카드 UI | 1h |
| 4 | 팀 수정/삭제 다이얼로그 | 0.5h |
| 5 | 상단 모니터링 카드 실데이터 복원 | 0.5h |

---

## 완성 후 기대 효과

- 해커톤마다 ADMIN이 팀 구성을 자유롭게 설정
- 팀 이름/색상/프로젝트명 커스텀 가능
- 팀 카드 안에서 Figma/Task/Issue/GitHub/FAQ/API Doc 전부 독립 관리
- 참가/탈퇴 버튼으로 팀원 셀프 등록
- 실시간 채팅으로 팀 간 소통
- → 해커톤 페이지 그 자체로 완결된 운영 툴