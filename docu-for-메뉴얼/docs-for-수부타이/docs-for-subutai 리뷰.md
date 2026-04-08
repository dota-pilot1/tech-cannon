# Subutai Review 기능 구현 계획

## 개요

GitHub PR/커밋 URL을 입력하면 AI가 코드 리뷰를 제공하는 기능.
기존 Subutai AI 페이지 UI를 참고하되, 질문 입력창 대신 커밋 URL 입력창으로 대체.
히스토리만 사이드바에 표시.

---

## 메뉴 구조

```
Subutai
├── AI      (/subutai/ai)       - 기존: 문서 기반 Q&A
├── Docu    (/subutai/docu)     - 기존: 문서 관리
├── FAQ     (/subutai/faq)      - 기존: FAQ
└── Review  (/subutai/review)   - 신규: AI 코드 리뷰
```

---

## 페이지 레이아웃 (SubutaiAiPage 참고)

```
┌─────────────────────────┬────────────────────────────────────────┐
│  좌측: 히스토리 사이드바  │  우측: 리뷰 결과 패널                   │
│  ─────────────────────  │  ─────────────────────────────────────  │
│  🕑 히스토리             │  헤더: Subutai Review  Beta             │
│                         │                                         │
│  [PR 제목 또는 커밋 SHA] │  (리뷰 결과 없을 때)                    │
│  2025.04.07 14:23       │  🤖 아이콘                              │
│                         │  "PR/커밋 URL을 입력하고                │
│  [PR 제목 또는 커밋 SHA] │   코드 리뷰를 요청하세요"               │
│  2025.04.06 09:11       │                                         │
│                         │  (리뷰 결과 있을 때)                    │
│  ...                    │  마크다운으로 렌더링된 리뷰 내용         │
│                         │  파일별 섹션 구분                       │
│                         │  🔴 Critical / 🟡 Warning / 🟢 Suggest │
│                         │                                         │
│                         │  ─────────────────────────────────────  │
│                         │  하단 입력창:                           │
│                         │  [ GitHub PR 또는 커밋 URL 입력... ] 🚀 │
└─────────────────────────┴────────────────────────────────────────┘
```

---

## 기능 흐름

```
1. 하단 입력창에 GitHub URL 입력
   - PR:     https://github.com/{owner}/{repo}/pull/{number}
   - Commit: https://github.com/{owner}/{repo}/commit/{sha}
        ↓
2. 전송 버튼 클릭 (또는 Ctrl+Enter)
        ↓
3. 백엔드 POST /api/subutai/review
   - URL 파싱 (PR vs 커밋 구분)
   - GitHub API로 diff fetch
     - PR:     GET /repos/{owner}/{repo}/pulls/{number}
               Accept: application/vnd.github.v3.diff
     - Commit: GET /repos/{owner}/{repo}/commits/{sha}
               Accept: application/vnd.github.v3.diff
   - diff → OpenAI gpt-4o 전달
   - 리뷰 결과 반환 + DB 히스토리 저장
        ↓
4. 우측 패널에 마크다운 리뷰 결과 표시
5. 좌측 히스토리 목록 갱신
```

---

## 백엔드 구현

### 신규 파일

#### `SubutaiReviewController.java`
- 경로: `subutai/review/presentation/`
- `POST /api/subutai/review` - 리뷰 요청
- `GET  /api/subutai/review/histories` - 히스토리 목록
- `DELETE /api/subutai/review/histories/{id}` - 히스토리 삭제

#### `SubutaiReviewService.java`
- 경로: `subutai/review/application/`
- URL 파싱 (PR vs 커밋 구분)
- GitHub API diff fetch (기존 `GithubContentFetcher`의 token 재사용)
- diff 너무 클 경우 파일별 분할 처리 (MAX ~12,000 토큰)
- OpenAI 호출 (기존 `SubutaiChatService` 패턴 재사용)
- 히스토리 저장

#### `SubutaiReviewHistory.java` (domain)
#### `SubutaiReviewHistoryMapper.java` (infrastructure)
#### `SubutaiReviewHistoryMapper.xml`
#### `SubutaiReviewRequest.java` / `SubutaiReviewResponse.java` (dto)

### DB

```sql
CREATE TABLE subutai_review_histories (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    url         VARCHAR(500) NOT NULL,
    pr_title    VARCHAR(300),
    review      TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_subutai_review_histories_user_id ON subutai_review_histories(user_id);
```

---

## 프론트엔드 구현

### 신규 파일

#### `SubutaiReviewPage.tsx`
- 경로: `src/pages/subutai/`
- SubutaiAiPage 레이아웃 참고
- 좌측: 히스토리 탭만 (문서/저장소 탭 없음)
- 우측: 리뷰 결과 패널 + 하단 URL 입력창
- `renderMarkdown()` 재사용하여 리뷰 결과 렌더링

### 수정 파일

#### `src/app/routes/index.tsx`
- `/subutai/review` 라우트 추가

#### Header 메뉴
- Subutai 드롭다운에 Review 항목 추가

---

## 시스템 프롬프트

```
당신은 TechCannon 팀의 시니어 코드 리뷰어입니다.
아래 GitHub diff를 분석하여 한국어로 코드 리뷰를 작성해주세요.

리뷰 형식:
## 전체 요약
변경사항에 대한 간결한 요약 (2~3줄)

## 파일별 리뷰
### 파일명
- 🔴 [Critical] 반드시 수정이 필요한 버그, 보안 이슈
- 🟡 [Warning]  성능 저하 또는 잠재적 문제
- 🟢 [Suggest]  더 나은 코드를 위한 개선 제안

## 총평
전반적인 코드 품질 평가 및 잘 된 점
```

---

## 구현 순서

| 단계 | 작업 |
|------|------|
| 1 | DB 테이블 생성 |
| 2 | 백엔드: domain/dto/mapper/xml |
| 3 | 백엔드: SubutaiReviewService (GitHub diff fetch + OpenAI 호출) |
| 4 | 백엔드: SubutaiReviewController |
| 5 | 프론트: SubutaiReviewPage.tsx |
| 6 | 프론트: 라우트 + 메뉴 추가 |

---

## 예상 작업량

- 백엔드: ~2시간
- 프론트: ~1시간
- 합계: ~3시간 이내