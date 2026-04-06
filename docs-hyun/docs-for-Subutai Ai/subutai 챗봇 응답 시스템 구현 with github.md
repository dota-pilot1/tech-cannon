# Subutai AI - GitHub 기반 챗봇 응답 시스템 구현 계획

> 실제 프로젝트 GitHub 코드를 참고하여 OpenAI GPT-4o가 답변하는 내부 AI 챗봇

---

## 구현 가능 여부

**→ 완전히 가능합니다.**

GitHub API를 통해 레포지토리의 파일 목록과 코드를 가져와 OpenAI 컨텍스트로 전달하는 방식입니다.
기존 SubutaiAiPage UI 뼈대가 이미 있고, OpenAI API Key도 등록되어 있어 빠르게 구현할 수 있습니다.

---

## 전체 흐름

```
사용자
  │
  ▼
[프론트] 좌측 트리에서 폴더 또는 GitHub URL 선택
  │
  ▼
[프론트] 질문 입력 + 전송
  │
  ▼
[백엔드] POST /api/subutai/chat
  │  ├─ 선택된 GitHub URL 목록 수신
  │  ├─ GitHub API로 해당 파일 코드 fetch
  │  ├─ 코드 내용 조합 → 시스템 프롬프트 생성
  │  └─ OpenAI GPT-4o API 호출
  │
  ▼
[백엔드] 응답 반환 + 히스토리 DB 저장
  │
  ▼
[프론트] 챗봇 패널에 AI 답변 렌더링
```

---

## 좌측 트리 구조 (GitHub 참고 소스 관리)

```
참고 소스
├─ 📁 백엔드
│   ├─ 🔗 https://github.com/org/repo/blob/main/src/.../JwtFilter.java
│   └─ 🔗 https://github.com/org/repo/blob/main/src/.../SecurityConfig.java
├─ 📁 프론트엔드
│   ├─ 🔗 https://github.com/org/repo/blob/main/src/pages/...
│   └─ 🔗 https://github.com/org/repo/tree/main/src/features/auth
└─ 📁 공통
    └─ 🔗 https://github.com/org/repo (레포 전체)
```

- **폴더**: 그룹핑 용도 (DB 저장)
- **GitHub URL**: 파일 단일 URL 또는 디렉토리 URL 또는 레포 전체 URL
- 체크박스로 선택 → 선택된 것만 AI 컨텍스트로 사용

---

## GitHub URL 지원 범위

| URL 형식 | 처리 방식 |
|---|---|
| 파일 URL (`/blob/main/파일.java`) | 해당 파일 내용 1개 fetch |
| 디렉토리 URL (`/tree/main/src/`) | 하위 파일 목록 fetch 후 내용 조합 (최대 20개) |
| 레포 URL (`github.com/org/repo`) | README + 주요 파일 fetch |

---

## DB 설계

```sql
-- GitHub 참고 소스 폴더
CREATE TABLE subutai_github_folders (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    order_num  INTEGER DEFAULT 0,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GitHub URL 항목
CREATE TABLE subutai_github_items (
    id          BIGSERIAL PRIMARY KEY,
    folder_id   BIGINT REFERENCES subutai_github_folders(id) ON DELETE CASCADE,
    label       VARCHAR(200) NOT NULL,       -- 표시 이름 (예: "JWT 필터")
    github_url  TEXT NOT NULL,               -- GitHub URL
    order_num   INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 채팅 히스토리
CREATE TABLE subutai_chat_histories (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    question        TEXT NOT NULL,
    answer          TEXT NOT NULL,
    github_urls     TEXT[],                  -- 참조된 GitHub URL 목록
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 백엔드 API 설계

```
# GitHub 소스 관리
GET    /api/subutai/github/folders              폴더 목록 + 하위 아이템
POST   /api/subutai/github/folders              폴더 생성
DELETE /api/subutai/github/folders/{id}         폴더 삭제

POST   /api/subutai/github/items                GitHub URL 아이템 추가
DELETE /api/subutai/github/items/{id}           아이템 삭제

# 챗봇
POST   /api/subutai/chat                        AI 질의 (핵심)
GET    /api/subutai/chat/histories              내 대화 히스토리
DELETE /api/subutai/chat/histories/{id}         히스토리 삭제
```

### POST /api/subutai/chat 요청/응답

```json
// 요청
{
  "question": "JWT 필터는 어떻게 동작하나요?",
  "githubItemIds": [1, 3, 5]
}

// 응답
{
  "answer": "JwtAuthenticationFilter는 OncePerRequestFilter를 상속받아...",
  "referencedUrls": [
    "https://github.com/org/repo/blob/main/src/.../JwtFilter.java"
  ]
}
```

---

## 백엔드 핵심 로직 (ChatService)

```java
@Service
public class SubutaiChatService {

    // 1. GitHub URL들로부터 코드 내용 수집
    private String fetchGithubContents(List<String> urls) {
        StringBuilder sb = new StringBuilder();
        for (String url : urls) {
            // GitHub URL → Raw API URL 변환
            // https://github.com/org/repo/blob/main/src/File.java
            // → https://api.github.com/repos/org/repo/contents/src/File.java
            String rawContent = githubApiClient.fetchContent(url);
            sb.append("=== ").append(url).append(" ===\n");
            sb.append(rawContent).append("\n\n");
        }
        return sb.toString();
    }

    // 2. OpenAI 호출
    public String chat(String question, List<String> githubUrls) {
        String codeContext = fetchGithubContents(githubUrls);

        String systemPrompt = """
            당신은 TechCannon 팀의 내부 AI 어시스턴트 Subutai입니다.
            아래 제공된 실제 프로젝트 코드를 기반으로 답변하세요.
            코드에 없는 내용은 일반 지식으로 보완하되, 코드 기반 답변을 우선하세요.
            
            [프로젝트 코드]
            %s
            """.formatted(codeContext);

        // OpenAI API 호출 (RestTemplate or WebClient)
        return openAiClient.chat(systemPrompt, question);
    }
}
```

---

## GitHub API 활용

### Public 레포 (토큰 불필요)
```
GET https://api.github.com/repos/{owner}/{repo}/contents/{path}
```

### Private 레포 (GitHub Token 필요)
```
Authorization: token {GITHUB_TOKEN}
```

→ `application.yml`에 `github.token` 환경변수로 관리

### URL 파싱 로직
```
github.com/{owner}/{repo}/blob/{branch}/{path}  → 파일
github.com/{owner}/{repo}/tree/{branch}/{path}  → 디렉토리
github.com/{owner}/{repo}                        → 레포 루트
```

---

## 토큰 제한 대응 전략

| 상황 | 처리 |
|---|---|
| 파일 1개 | 전체 내용 전달 |
| 디렉토리 | 파일 최대 20개, 각 500줄 제한 |
| 레포 전체 | README + 주요 확장자만 (.java, .ts, .tsx, .yml) |
| 전체 초과 시 | 토큰 수 계산 후 초과분 truncate 처리 |

GPT-4o 컨텍스트 128k 토큰 기준 → 코드 약 50~100개 파일 처리 가능

---

## 구현 Phase

### Phase 1 - DB + GitHub 소스 관리 API (1~2일)
- [ ] `subutai_github_folders`, `subutai_github_items` 테이블 생성 (로컬+EC2)
- [ ] 폴더/아이템 CRUD API 구현
- [ ] 프론트 좌측 트리 실데이터 연동 (폴더 추가/삭제, URL 추가/삭제)
- [ ] 인라인 입력 UI (폴더명 입력, GitHub URL + 라벨 입력)

### Phase 2 - GitHub 코드 Fetch (1일)
- [ ] GitHub URL 파싱 유틸리티 구현
- [ ] GitHub API 연동 (Public: 토큰 없이, Private: 토큰 사용)
- [ ] 파일/디렉토리/레포 분기 처리
- [ ] 토큰 초과 방지 truncate 로직

### Phase 3 - OpenAI 연동 + 히스토리 (1~2일)
- [ ] `subutai_chat_histories` 테이블 생성
- [ ] OpenAI GPT-4o API 연동 (RestTemplate)
- [ ] `POST /api/subutai/chat` 엔드포인트 구현
- [ ] 프론트 실제 API 연동 (더미 setTimeout 제거)
- [ ] 히스토리 저장/조회 UI

---

## 환경변수 관리

```yaml
# application.yml (로컬)
openai:
  api-key: ${OPENAI_API_KEY}
  model: gpt-4o

github:
  token: ${GITHUB_TOKEN:}   # public 레포는 없어도 됨
```

```bash
# EC2 application.yml에 추가 필요
OPENAI_API_KEY=sk-proj-...  # 이미 .env에 있음
GITHUB_TOKEN=ghp_...         # private 레포 필요 시
```

> ⚠️ OpenAI API Key는 절대 코드에 하드코딩 금지. 이미 application.yml 환경변수로 설정됨.

---

## 주의사항

1. **Rate Limit**: GitHub API는 미인증 시 60req/h, 토큰 인증 시 5000req/h
2. **Private 레포**: GitHub Personal Access Token(repo 권한) 필요
3. **비용**: GPT-4o 기준 Input $2.50/1M tokens → 코드 많을수록 비용 증가
4. **보안**: 내부 프로젝트 코드가 OpenAI로 전송됨 → 팀 내 공유 필요
5. **응답 속도**: GitHub fetch + OpenAI 합산 3~10초 → 로딩 인디케이터 필수

요약:
트리 구현해서 참고 깃허브 저장 체계 만들고 오른쪽에서 openai 든 claude 든 연동 해서 그 저장소 참고해서 질문에 답변 해주는 시스템 가능 하다 이거지?

그렇다면 ㄱㄱㄱ

왼쪽탭은 2탭으로 저장소 정보, 히스토리 이렇게 두개면 될듯? 

거의 openai 혹은 claude 와 비슷한 ui 이든 프로젝트 내부 정보 참고 하도록 하는 그런 기능 구현 한다는거 맞지?

만약 그렇다면 ㄱㄱㄱ
