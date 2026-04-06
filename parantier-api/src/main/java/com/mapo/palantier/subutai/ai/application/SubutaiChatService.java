package com.mapo.palantier.subutai.ai.application;

import com.mapo.palantier.subutai.ai.domain.SubutaiChatHistory;
import com.mapo.palantier.subutai.ai.domain.SubutaiGithubFolder;
import com.mapo.palantier.subutai.ai.domain.SubutaiGithubItem;
import com.mapo.palantier.subutai.ai.dto.SubutaiChatRequest;
import com.mapo.palantier.subutai.ai.dto.SubutaiChatResponse;
import com.mapo.palantier.subutai.ai.dto.SubutaiGithubFolderRequest;
import com.mapo.palantier.subutai.ai.dto.SubutaiGithubFolderUpdateRequest;
import com.mapo.palantier.subutai.ai.dto.SubutaiGithubItemRequest;
import com.mapo.palantier.subutai.ai.dto.SubutaiGithubItemUpdateRequest;
import com.mapo.palantier.subutai.ai.infrastructure.SubutaiChatHistoryMapper;
import com.mapo.palantier.subutai.ai.infrastructure.SubutaiGithubFolderMapper;
import com.mapo.palantier.subutai.ai.infrastructure.SubutaiGithubItemMapper;
import com.mapo.palantier.subutai.ai.util.GithubContentFetcher;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
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

    private final SubutaiGithubFolderMapper folderMapper;
    private final SubutaiGithubItemMapper itemMapper;
    private final SubutaiChatHistoryMapper historyMapper;
    private final GithubContentFetcher githubFetcher;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    @Value("${openai.model:gpt-4o}")
    private String openAiModel;

    private static final String OPENAI_URL =
        "https://api.openai.com/v1/chat/completions";

    // ── 메뉴얼 문서 URL (docu-for-메뉴얼) ────────────────────────────────────
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

    // 메뉴얼 캐시 (서버 재시작 전까지 유지)
    private final Map<String, String> manualCache = new ConcurrentHashMap<>();

    // ── GitHub 폴더 관리 ──────────────────────────────────────────────────────

    public List<SubutaiGithubFolder> getFolders() {
        List<SubutaiGithubFolder> folders = folderMapper.findAll();
        for (SubutaiGithubFolder folder : folders) {
            folder.setItems(itemMapper.findByFolderId(folder.getId()));
        }
        return folders;
    }

    @Transactional
    public void createFolder(SubutaiGithubFolderRequest req, Long userId) {
        com.mapo.palantier.subutai.ai.domain.SubutaiGithubFolder folder =
            new com.mapo.palantier.subutai.ai.domain.SubutaiGithubFolder();
        folder.setName(req.getName());
        folder.setOrderNum(0);
        folder.setCreatedBy(userId);
        folderMapper.insert(folder);
    }

    @Transactional
    public void updateFolder(Long id, SubutaiGithubFolderUpdateRequest req) {
        SubutaiGithubFolder folder = folderMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException("폴더를 찾을 수 없습니다: " + id)
            );
        folder.setName(req.getName());
        folderMapper.update(folder);
    }

    @Transactional
    public void deleteFolder(Long id) {
        folderMapper.delete(id);
    }

    // ── GitHub 아이템 관리 ────────────────────────────────────────────────────

    @Transactional
    public void createItem(SubutaiGithubItemRequest req) {
        SubutaiGithubItem item = new SubutaiGithubItem();
        item.setFolderId(req.getFolderId());
        item.setLabel(req.getLabel());
        item.setGithubUrl(req.getGithubUrl());
        item.setOrderNum(0);
        itemMapper.insert(item);
    }

    @Transactional
    public void updateItem(Long id, SubutaiGithubItemUpdateRequest req) {
        SubutaiGithubItem item = itemMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException("아이템을 찾을 수 없습니다: " + id)
            );
        item.setLabel(req.getLabel());
        item.setGithubUrl(req.getGithubUrl());
        itemMapper.update(item);
    }

    @Transactional
    public void deleteItem(Long id) {
        itemMapper.delete(id);
    }

    // ── 메뉴얼 문서 로더 ──────────────────────────────────────────────────────

    /**
     * docu-for-메뉴얼 의 3개 문서를 fetch해서 합친 문자열 반환
     * 캐시 적용: 서버 재시작 전까지 재사용
     */
    private String loadManualDocs() {
        String cacheKey = "manual_docs";
        if (manualCache.containsKey(cacheKey)) {
            return manualCache.get(cacheKey);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("=== 프로젝트 메뉴얼 문서 ===\n\n");

        // 기본 아키텍처 문서 3개
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

        // 주요 공통 로직 문서 5개
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

    /** 캐시 무효화 (필요 시 호출) */
    public void clearManualCache() {
        manualCache.clear();
        log.info("메뉴얼 캐시 초기화 완료");
    }

    // ── 챗봇 (Function Calling) ───────────────────────────────────────────────

    @Transactional
    public SubutaiChatResponse chat(SubutaiChatRequest req, Long userId) {
        List<SubutaiGithubItem> selectedItems = Collections.emptyList();
        List<String> selectedUrls = new ArrayList<>();

        if (
            req.getGithubItemIds() != null && !req.getGithubItemIds().isEmpty()
        ) {
            selectedItems = itemMapper.findByIds(req.getGithubItemIds());
            selectedUrls = selectedItems
                .stream()
                .map(SubutaiGithubItem::getGithubUrl)
                .collect(Collectors.toList());
        }

        String answer;

        if (selectedItems.isEmpty()) {
            // 선택된 저장소 없음 → 일반 답변
            answer = callOpenAiSimple(req.getQuestion());
        } else {
            // Function Calling으로 어떤 코드가 필요한지 GPT가 결정
            answer = callOpenAiWithFunctionCalling(
                req.getQuestion(),
                selectedItems
            );
        }

        // 히스토리 저장
        SubutaiChatHistory history = new SubutaiChatHistory();
        history.setUserId(userId);
        history.setQuestion(req.getQuestion());
        history.setAnswer(answer);
        history.setGithubUrls(selectedUrls.toArray(new String[0]));
        historyMapper.insert(history);

        return SubutaiChatResponse.builder()
            .answer(answer)
            .referencedUrls(selectedUrls)
            .build();
    }

    // ── Step 1: Function Calling으로 필요한 코드 결정 ─────────────────────────

    @SuppressWarnings("unchecked")
    private String callOpenAiWithFunctionCalling(
        String question,
        List<SubutaiGithubItem> items
    ) {
        // 등록된 GitHub URL 목록을 시스템 프롬프트에 포함
        StringBuilder urlList = new StringBuilder();
        for (SubutaiGithubItem item : items) {
            urlList
                .append("- ")
                .append(item.getLabel())
                .append(": ")
                .append(item.getGithubUrl())
                .append("\n");
        }

        // 메뉴얼 문서 로드
        String manualDocs = loadManualDocs();

        String systemPrompt = """
            당신은 TechCannon 팀의 내부 AI 어시스턴트 Subutai입니다.
            사용자의 질문을 분석하고, 답변에 필요한 GitHub 코드를 가져오기 위해
            아래 함수를 호출하세요.

            아래는 프로젝트의 구조와 아키텍처 문서입니다. 이를 기반으로
            어떤 코드를 가져올지 정확하게 판단하세요:

            %s

            등록된 GitHub 저장소:
            %s
            질문의 성격을 판단해서:
            - 백엔드(API, Spring, Java, DB, 서버, Controller, Service, Mapper) 관련 → backend 선택
            - 프론트엔드(UI, React, TypeScript, 컴포넌트, 페이지, 훅) 관련 → frontend 선택
            - 둘 다 관련 → both 선택
            """.formatted(manualDocs, urlList.toString());

        // Function 정의
        Map<String, Object> fetchCodeFunction = buildFetchCodeFunctionDef(
            items
        );

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", openAiModel);
        requestBody.put(
            "messages",
            List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", question)
            )
        );
        requestBody.put(
            "tools",
            List.of(Map.of("type", "function", "function", fetchCodeFunction))
        );
        requestBody.put("tool_choice", "auto");
        requestBody.put("temperature", 0.2);

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

            // Function Call 여부 확인
            List<Map<String, Object>> toolCalls = (List<
                Map<String, Object>
            >) message.get("tool_calls");

            if (toolCalls != null && !toolCalls.isEmpty()) {
                // GPT가 함수 호출을 결정함 → 코드 fetch 후 2차 호출
                return handleToolCalls(question, message, toolCalls, items);
            } else {
                // 함수 호출 없이 바로 답변
                return (String) message.get("content");
            }
        } catch (Exception e) {
            log.error("Function Calling 실패", e);
            return "AI 응답 중 오류가 발생했습니다: " + e.getMessage();
        }
    }

    // ── Step 2: Tool Call 처리 → 코드 fetch → 2차 GPT 호출 ──────────────────

    @SuppressWarnings("unchecked")
    private String handleToolCalls(
        String question,
        Map<String, Object> assistantMessage,
        List<Map<String, Object>> toolCalls,
        List<SubutaiGithubItem> items
    ) {
        List<Map<String, Object>> messages = new ArrayList<>();
        // 2차 호출 시에도 메뉴얼 문서 포함
        String manualDocs = loadManualDocs();

        messages.add(
            Map.of(
                "role",
                "system",
                "content",
                """
                당신은 TechCannon 팀의 내부 AI 어시스턴트 Subutai입니다.
                아래 프로젝트 메뉴얼 문서와 실제 코드를 함께 참고하여 답변하세요.
                메뉴얼 문서로 전체 구조를 파악하고, 실제 코드로 세부 구현을 확인하세요.
                코드에 없는 내용은 메뉴얼 문서를 우선 참고하고, 그래도 없으면 일반 지식으로 보완하세요.
                답변은 한국어로 해주세요.

                [프로젝트 메뉴얼]
                %s
                """.formatted(manualDocs)
            )
        );
        messages.add(Map.of("role", "user", "content", question));
        messages.add(assistantMessage); // assistant의 function call 메시지

        // 각 tool_call 처리
        for (Map<String, Object> toolCall : toolCalls) {
            String toolCallId = (String) toolCall.get("id");
            Map<String, Object> function = (Map<String, Object>) toolCall.get(
                "function"
            );
            String funcName = (String) function.get("name");
            String argsJson = (String) function.get("arguments");

            String fetchedCode = "";

            if ("get_github_code".equals(funcName)) {
                try {
                    Map<String, Object> args = parseJson(argsJson);
                    String target = (String) args.getOrDefault(
                        "target",
                        "both"
                    );
                    fetchedCode = fetchCodeByTarget(target, items);
                    log.info(
                        "Function Calling → target: {}, 코드 {}자 fetch",
                        target,
                        fetchedCode.length()
                    );
                } catch (Exception e) {
                    log.warn("Function args 파싱 실패: {}", e.getMessage());
                    fetchedCode = fetchAllCode(items);
                }
            }

            // tool 결과 메시지 추가
            messages.add(
                Map.of(
                    "role",
                    "tool",
                    "tool_call_id",
                    toolCallId,
                    "content",
                    fetchedCode.isEmpty()
                        ? "[코드를 가져오지 못했습니다]"
                        : fetchedCode
                )
            );
        }

        // 2차 GPT 호출 (코드 포함)
        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", openAiModel);
        requestBody.put("messages", messages);
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
            log.error("2차 OpenAI 호출 실패", e);
            return "AI 응답 중 오류가 발생했습니다: " + e.getMessage();
        }
    }

    // ── target에 따라 적절한 GitHub 경로 fetch ────────────────────────────────

    private String fetchCodeByTarget(
        String target,
        List<SubutaiGithubItem> items
    ) {
        StringBuilder sb = new StringBuilder();

        for (SubutaiGithubItem item : items) {
            String url = item.getGithubUrl();
            String label = item.getLabel();

            // 레포 루트 URL인지 판단 (blob/tree가 없으면 루트)
            boolean isRepoRoot =
                !url.contains("/blob/") && !url.contains("/tree/");

            if (isRepoRoot) {
                // 레포 루트 → target에 따라 서브 디렉토리 직접 탐색
                String fetchUrl = buildTargetUrl(url, target);
                sb
                    .append("=== [")
                    .append(label)
                    .append("] ")
                    .append(fetchUrl)
                    .append(" ===\n");
                sb.append(githubFetcher.fetchContent(fetchUrl));
                sb.append("\n\n");
            } else {
                // 특정 파일/디렉토리 URL → 그대로 사용
                sb
                    .append("=== [")
                    .append(label)
                    .append("] ")
                    .append(url)
                    .append(" ===\n");
                sb.append(githubFetcher.fetchContent(url));
                sb.append("\n\n");
            }
        }

        return sb.toString();
    }

    /**
     * 레포 루트 URL을 target에 맞는 서브 디렉토리 URL로 변환
     * ex) github.com/org/repo → github.com/org/repo/tree/main/parantier-api/src/main/java
     */
    private String buildTargetUrl(String repoUrl, String target) {
        // 기본 브랜치는 main으로 가정 (GithubContentFetcher에서 fallback 처리)
        String base = repoUrl.replaceAll("/$", "");
        return switch (target) {
            case "backend" -> base + "/tree/main/parantier-api/src/main/java";
            case "frontend" -> base + "/tree/main/parantier-front/src";
            case "both" -> base; // 둘 다 → 루트 전체 탐색 (GithubContentFetcher가 처리)
            default -> base;
        };
    }

    private String fetchAllCode(List<SubutaiGithubItem> items) {
        return fetchCodeByTarget("both", items);
    }

    // ── Function 정의 빌드 ────────────────────────────────────────────────────

    private Map<String, Object> buildFetchCodeFunctionDef(
        List<SubutaiGithubItem> items
    ) {
        // 등록된 저장소 라벨 목록
        List<String> repoLabels = items
            .stream()
            .map(SubutaiGithubItem::getLabel)
            .collect(Collectors.toList());

        Map<String, Object> properties = new LinkedHashMap<>();

        // target 파라미터
        properties.put(
            "target",
            Map.of(
                "type",
                "string",
                "enum",
                List.of("backend", "frontend", "both"),
                "description",
                "가져올 코드 영역. " +
                    "백엔드(Spring Boot, Java, API, DB) → backend, " +
                    "프론트엔드(React, TypeScript, UI, 컴포넌트) → frontend, " +
                    "둘 다 필요하거나 명확하지 않은 경우 → both"
            )
        );

        // repos 파라미터 (선택적)
        properties.put(
            "repos",
            Map.of(
                "type",
                "array",
                "items",
                Map.of("type", "string"),
                "description",
                "참조할 저장소 라벨 목록. 비우면 선택된 모든 저장소 사용. " +
                    "가능한 값: " +
                    repoLabels
            )
        );

        Map<String, Object> parameters = new LinkedHashMap<>();
        parameters.put("type", "object");
        parameters.put("properties", properties);
        parameters.put("required", List.of("target"));

        Map<String, Object> functionDef = new LinkedHashMap<>();
        functionDef.put("name", "get_github_code");
        functionDef.put(
            "description",
            "사용자의 질문에 답변하기 위해 GitHub 저장소에서 실제 프로젝트 코드를 가져옵니다. " +
                "질문의 성격(백엔드/프론트엔드)을 분석하여 적절한 코드를 선택하세요."
        );
        functionDef.put("parameters", parameters);

        return functionDef;
    }

    // ── 선택된 저장소 없을 때 일반 답변 ──────────────────────────────────────

    @SuppressWarnings("unchecked")
    private String callOpenAiSimple(String question) {
        // 저장소 미선택 시에도 메뉴얼 문서는 참고
        String manualDocs = loadManualDocs();

        String systemPrompt = """
            당신은 TechCannon 팀의 내부 AI 어시스턴트 Subutai입니다.
            아래 프로젝트 메뉴얼 문서를 참고하여 답변하세요.
            답변은 한국어로 해주세요.

            [프로젝트 메뉴얼]
            %s
            """.formatted(manualDocs);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", openAiModel);
        requestBody.put(
            "messages",
            List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", question)
            )
        );
        requestBody.put("max_tokens", 2000);
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

    /**
     * 간단한 JSON 파싱 (Jackson 없이 — arguments는 단순 구조)
     * {"target":"backend"} or {"target":"both","repos":["..."]}
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJson(String json) {
        // Spring의 RestTemplate이 이미 Jackson을 포함하므로 ObjectMapper 사용
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper =
                new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(json, Map.class);
        } catch (Exception e) {
            log.warn("JSON 파싱 실패: {}", json);
            return Map.of("target", "both");
        }
    }
}
