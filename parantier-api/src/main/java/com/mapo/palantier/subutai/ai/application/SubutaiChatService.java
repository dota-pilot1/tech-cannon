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

    // ── GitHub 폴더 관리 ──────────────────────────────────────

    public List<SubutaiGithubFolder> getFolders() {
        List<SubutaiGithubFolder> folders = folderMapper.findAll();
        for (SubutaiGithubFolder folder : folders) {
            folder.setItems(itemMapper.findByFolderId(folder.getId()));
        }
        return folders;
    }

    @Transactional
    public void createFolder(SubutaiGithubFolderRequest req, Long userId) {
        SubutaiGithubFolder folder = new SubutaiGithubFolder();
        folder.setName(req.getName());
        folder.setOrderNum(0);
        folder.setCreatedBy(userId);
        folderMapper.insert(folder);
    }

    @Transactional
    public void deleteFolder(Long id) {
        folderMapper.delete(id);
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

    // ── GitHub 아이템 관리 ────────────────────────────────────

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
    public void deleteItem(Long id) {
        itemMapper.delete(id);
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

    // ── 챗봇 ─────────────────────────────────────────────────

    @Transactional
    public SubutaiChatResponse chat(SubutaiChatRequest req, Long userId) {
        List<SubutaiGithubItem> items = Collections.emptyList();
        List<String> urls = new ArrayList<>();

        if (
            req.getGithubItemIds() != null && !req.getGithubItemIds().isEmpty()
        ) {
            items = itemMapper.findByIds(req.getGithubItemIds());
            urls = items
                .stream()
                .map(SubutaiGithubItem::getGithubUrl)
                .collect(Collectors.toList());
        }

        // GitHub 코드 fetch
        StringBuilder codeContext = new StringBuilder();
        for (SubutaiGithubItem item : items) {
            codeContext
                .append("=== [")
                .append(item.getLabel())
                .append("] ")
                .append(item.getGithubUrl())
                .append(" ===\n");
            codeContext.append(githubFetcher.fetchContent(item.getGithubUrl()));
            codeContext.append("\n\n");
        }

        // OpenAI 호출
        String answer = callOpenAi(req.getQuestion(), codeContext.toString());

        // 히스토리 저장
        SubutaiChatHistory history = new SubutaiChatHistory();
        history.setUserId(userId);
        history.setQuestion(req.getQuestion());
        history.setAnswer(answer);
        history.setGithubUrls(urls.toArray(new String[0]));
        historyMapper.insert(history);

        return SubutaiChatResponse.builder()
            .answer(answer)
            .referencedUrls(urls)
            .build();
    }

    private String callOpenAi(String question, String codeContext) {
        String systemPrompt;
        if (codeContext.isBlank()) {
            systemPrompt = """
                당신은 TechCannon 팀의 내부 AI 어시스턴트 Subutai입니다.
                개발 관련 질문에 친절하고 정확하게 답변해주세요.
                """;
        } else {
            systemPrompt = """
                당신은 TechCannon 팀의 내부 AI 어시스턴트 Subutai입니다.
                아래 제공된 실제 프로젝트 코드를 기반으로 답변하세요.
                코드에 없는 내용은 일반 지식으로 보완하되, 코드 기반 답변을 우선하세요.
                답변은 한국어로 해주세요.

                [참고 코드]
                %s
                """.formatted(codeContext);
        }

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

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        try {
            ResponseEntity<Map> resp = restTemplate.exchange(
                "https://api.openai.com/v1/chat/completions",
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

    // ── 히스토리 ──────────────────────────────────────────────

    public List<SubutaiChatHistory> getHistories(Long userId) {
        return historyMapper.findByUserId(userId);
    }

    @Transactional
    public void deleteHistory(Long id) {
        historyMapper.delete(id);
    }
}
