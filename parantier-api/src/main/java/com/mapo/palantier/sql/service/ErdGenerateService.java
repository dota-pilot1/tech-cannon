package com.mapo.palantier.sql.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mapo.palantier.sql.dto.ColumnInfo;
import com.mapo.palantier.sql.dto.ErdGenerateRequest;
import com.mapo.palantier.sql.dto.ErdGenerateResponse;
import com.mapo.palantier.sql.dto.TableInfo;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ErdGenerateService {

    private static final String OPENAI_API_URL =
        "https://api.openai.com/v1/chat/completions";

    private final ObjectMapper objectMapper;

    @Value("${openai.api-key:}")
    private String apiKey;

    @Value("${openai.model:gpt-4o}")
    private String model;

    public ErdGenerateResponse generate(ErdGenerateRequest request) {
        String userPrompt = buildUserPrompt(request.tables());
        String requestBody = buildRequestBody(userPrompt);

        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

        HttpRequest httpRequest = HttpRequest.newBuilder()
            .uri(URI.create(OPENAI_API_URL))
            .timeout(Duration.ofSeconds(60))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        try {
            HttpResponse<String> response = client.send(
                httpRequest,
                HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() != 200) {
                throw new RuntimeException(
                    "OpenAI API 호출 실패. status=" +
                        response.statusCode() +
                        ", body=" +
                        response.body()
                );
            }

            String mmd = extractMmdFromResponse(response.body());
            return new ErdGenerateResponse(mmd);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException(
                "OpenAI API 호출 중 오류가 발생했습니다: " + e.getMessage(),
                e
            );
        }
    }

    private String buildUserPrompt(List<TableInfo> tables) {
        StringBuilder sb = new StringBuilder();
        sb.append(
            "아래 테이블 스키마를 기반으로 Mermaid erDiagram을 생성해주세요.\n\n"
        );

        for (TableInfo table : tables) {
            sb.append("테이블명: ").append(table.getTableName()).append("\n");
            sb.append("컬럼:\n");
            for (ColumnInfo col : table.getColumns()) {
                sb.append("  - name: ").append(col.getName());
                sb.append(", type: ").append(col.getType());
                sb.append(", primaryKey: ").append(col.isPrimaryKey());
                sb.append(", notNull: ").append(col.isNotNull());
                sb.append("\n");
            }
            sb.append("\n");
        }

        sb.append("요구사항:\n");
        sb.append(
            "- FK 관계는 컬럼명 패턴(xxx_id)으로 추론해서 관계선 그리기\n"
        );
        sb.append("- 반드시 erDiagram으로 시작하는 mermaid 코드만 반환\n");
        sb.append("- 코드 펜스(```) 없이 erDiagram 코드만 반환\n");

        return sb.toString();
    }

    private String buildRequestBody(String userPrompt) {
        try {
            String systemContent =
                "You are an expert database designer. " +
                "Generate Mermaid erDiagram syntax from the given table schemas. " +
                "Return ONLY the mermaid code starting with 'erDiagram', no explanation, no markdown code fences.";

            var requestNode = objectMapper.createObjectNode();
            requestNode.put("model", model);
            requestNode.put("temperature", 0.2);

            var messagesArray = objectMapper.createArrayNode();

            var systemMessage = objectMapper.createObjectNode();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemContent);
            messagesArray.add(systemMessage);

            var userMessage = objectMapper.createObjectNode();
            userMessage.put("role", "user");
            userMessage.put("content", userPrompt);
            messagesArray.add(userMessage);

            requestNode.set("messages", messagesArray);

            return objectMapper.writeValueAsString(requestNode);
        } catch (Exception e) {
            throw new RuntimeException(
                "OpenAI 요청 바디 직렬화 실패: " + e.getMessage(),
                e
            );
        }
    }

    private String extractMmdFromResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String content = root
                .path("choices")
                .get(0)
                .path("message")
                .path("content")
                .asText();

            // 앞뒤 공백 제거
            content = content.strip();

            // 코드 펜스 제거 (```mermaid ... ``` 또는 ``` ... ```)
            if (content.startsWith("```")) {
                // 첫 번째 줄(펜스 오프닝) 제거
                int firstNewline = content.indexOf('\n');
                if (firstNewline != -1) {
                    content = content.substring(firstNewline + 1);
                }
                // 마지막 펜스 제거
                if (content.endsWith("```")) {
                    content = content.substring(0, content.lastIndexOf("```"));
                }
                content = content.strip();
            }

            return content;
        } catch (Exception e) {
            throw new RuntimeException(
                "OpenAI 응답 파싱 실패: " + e.getMessage(),
                e
            );
        }
    }
}
