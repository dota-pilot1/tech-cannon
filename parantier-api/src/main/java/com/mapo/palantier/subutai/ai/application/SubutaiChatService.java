package com.mapo.palantier.subutai.ai.application;

import com.mapo.palantier.subutai.ai.domain.SubutaiChatHistory;
import com.mapo.palantier.subutai.ai.dto.SubutaiChatRequest;
import com.mapo.palantier.subutai.ai.dto.SubutaiChatResponse;
import com.mapo.palantier.subutai.ai.infrastructure.SubutaiChatHistoryMapper;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubutaiChatService {

    private final SubutaiChatHistoryMapper historyMapper;
    private final SubutaiDocService docService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    @Value("${openai.model:gpt-4o}")
    private String openAiModel;

    private static final String OPENAI_URL =
        "https://api.openai.com/v1/chat/completions";

    // ── 메뉴얼 문서 URL ────────────────────────────────────────────────────────
    private static final String MANUAL_BASE =
        "https://raw.githubusercontent.com/dota-pilot1/tech-cannon/main/docu-for-%EB%A9%94%EB%89%B4%EC%96%BC/";
    private static final String MANUAL_COMMON_BASE =
        "https://raw.githubusercontent.com/dota-pilot1/tech-cannon/main/docu-for-%EB%A9%94%EB%89%B4%EC%96%BC/%EC%A3%BC%EC%9A%94%20%EA%B3%B5%ED%86%B5%20%EB%A1%9C%EC%A7%81/";
    private static final List<String> MANUAL_FILES = List.of(
        "프로젝트 정보.md",
        "백엔드 아키텍쳐 설명.md",
        "프론트 아키텍쳐 설명.md"
    );
    private static final List<String> MANUAL_COMMON_FILES = List.of(
        "공통 에러 처리.md",
        "메뉴 데이터 관리.md",
        "마이바티스 주요 아키텍쳐.md",
        "시큐리티 주요 구조.md",
        "인증 인가 주요 프로세스.md"
    );

    private final Map<String, String> manualCache = new ConcurrentHashMap<>();

    // ── 챗봇 ──────────────────────────────────────────────────────────────────

    @Transactional
    public SubutaiChatResponse chat(SubutaiChatRequest req, Long userId) {
        String manualDocs = loadManualDocs();
        String docContext = docService.buildContext(req.getPostIds());
        String answer = callOpenAiSimple(
            req.getQuestion(),
            manualDocs,
            docContext
        );

        SubutaiChatHistory history = new SubutaiChatHistory();
        history.setUserId(userId);
        history.setQuestion(req.getQuestion());
        history.setAnswer(answer);
        history.setGithubUrls(new String[0]);
        historyMapper.insert(history);

        return SubutaiChatResponse.builder()
            .answer(answer)
            .referencedUrls(java.util.List.of())
            .build();
    }

    // ── OpenAI 호출 ────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private String callOpenAiSimple(
        String question,
        String manualDocs,
        String docContext
    ) {
        String docSection = (docContext == null || docContext.isBlank())
            ? ""
            : "\n\n[참고 문서 - 최우선 참고]\n" + docContext;

        String systemPrompt = """
            당신은 TechCannon 팀의 내부 AI 어시스턴트 Subutai입니다.
            아래 문서들을 참고하여 정확하게 답변하세요.
            답변은 한국어로 해주세요.

            [프로젝트 메뉴얼]
            %s
            %s
            """.formatted(manualDocs, docSection);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", openAiModel);
        requestBody.put(
            "messages",
            List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", question)
            )
        );
        requestBody.put("max_tokens", 3000);
        requestBody.put("temperature", 0.7);

        HttpHeaders headers = buildHeaders();
        try {
            ResponseEntity<Map> resp = restTemplate.exchange(
                OPENAI_URL,
                HttpMethod.POST,
                new HttpEntity<>(requestBody, headers),
                Map.class
            );
            Map body = resp.getBody();
            if (body == null) return "응답을 받지 못했습니다.";
            List<Map<String, Object>> choices = (List<
                Map<String, Object>
            >) body.get("choices");
            if (
                choices == null || choices.isEmpty()
            ) return "응답이 비어있습니다.";
            Map<String, Object> message = (Map<String, Object>) choices
                .get(0)
                .get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            log.error("OpenAI 호출 실패", e);
            return "AI 응답 중 오류가 발생했습니다: " + e.getMessage();
        }
    }

    // ── 메뉴얼 문서 로드 ──────────────────────────────────────────────────────

    private String loadManualDocs() {
        String cacheKey = "manual_docs";
        if (manualCache.containsKey(cacheKey)) {
            return manualCache.get(cacheKey);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("=== 프로젝트 메뉴얼 문서 ===\n\n");

        for (String filename : MANUAL_FILES) {
            try {
                String encodedName = java.net.URLEncoder.encode(
                    filename,
                    java.nio.charset.StandardCharsets.UTF_8
                ).replace("+", "%20");
                String url = MANUAL_BASE + encodedName;

                HttpHeaders headers = new HttpHeaders();
                headers.set("User-Agent", "SubutaiAI/1.0");
                ResponseEntity<String> resp = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
                );
                if (resp.getBody() != null) {
                    sb.append("--- ").append(filename).append(" ---\n");
                    sb.append(resp.getBody()).append("\n\n");
                    log.info("메뉴얼 문서 로드 완료: {}", filename);
                }
            } catch (Exception e) {
                log.warn(
                    "메뉴얼 문서 로드 실패 ({}): {}",
                    filename,
                    e.getMessage()
                );
            }
        }

        sb.append("=== 주요 공통 로직 문서 ===\n\n");
        for (String filename : MANUAL_COMMON_FILES) {
            try {
                String encodedName = java.net.URLEncoder.encode(
                    filename,
                    java.nio.charset.StandardCharsets.UTF_8
                ).replace("+", "%20");
                String url = MANUAL_COMMON_BASE + encodedName;

                HttpHeaders headers = new HttpHeaders();
                headers.set("User-Agent", "SubutaiAI/1.0");
                ResponseEntity<String> resp = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
                );
                if (resp.getBody() != null) {
                    sb.append("--- ").append(filename).append(" ---\n");
                    sb.append(resp.getBody()).append("\n\n");
                    log.info("공통 로직 문서 로드 완료: {}", filename);
                }
            } catch (Exception e) {
                log.warn(
                    "공통 로직 문서 로드 실패 ({}): {}",
                    filename,
                    e.getMessage()
                );
            }
        }

        String result = sb.toString();
        if (result.length() > 100) {
            manualCache.put(cacheKey, result);
        }
        return result;
    }

    public void clearManualCache() {
        manualCache.clear();
        log.info("메뉴얼 캐시 초기화 완료");
    }

    // ── 히스토리 ──────────────────────────────────────────────────────────────

    public List<SubutaiChatHistory> getHistories(Long userId) {
        return historyMapper.findByUserId(userId);
    }

    @Transactional
    public void deleteHistory(Long id) {
        historyMapper.delete(id);
    }

    // ── 유틸 ──────────────────────────────────────────────────────────────────

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);
        return headers;
    }
}
