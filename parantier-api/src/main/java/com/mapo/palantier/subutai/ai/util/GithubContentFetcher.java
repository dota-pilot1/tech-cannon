package com.mapo.palantier.subutai.ai.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.*;

@Slf4j
@Component
public class GithubContentFetcher {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${github.token:}")
    private String githubToken;

    // github.com/{owner}/{repo}/blob/{branch}/{path} → 파일 내용
    // github.com/{owner}/{repo}/tree/{branch}/{path} → 디렉토리 하위 파일들
    // github.com/{owner}/{repo}                      → README
    public String fetchContent(String githubUrl) {
        try {
            String normalized = githubUrl.trim().replaceAll("/$", "");

            // blob → 단일 파일
            Pattern blobPattern = Pattern.compile(
                "github\\.com/([^/]+)/([^/]+)/blob/([^/]+)/(.+)");
            Matcher blobMatcher = blobPattern.matcher(normalized);
            if (blobMatcher.find()) {
                String owner = blobMatcher.group(1);
                String repo  = blobMatcher.group(2);
                String branch = blobMatcher.group(3);
                String path  = blobMatcher.group(4);
                return fetchFileContent(owner, repo, branch, path);
            }

            // tree → 디렉토리
            Pattern treePattern = Pattern.compile(
                "github\\.com/([^/]+)/([^/]+)/tree/([^/]+)/(.+)");
            Matcher treeMatcher = treePattern.matcher(normalized);
            if (treeMatcher.find()) {
                String owner  = treeMatcher.group(1);
                String repo   = treeMatcher.group(2);
                String branch = treeMatcher.group(3);
                String path   = treeMatcher.group(4);
                return fetchDirectoryContents(owner, repo, branch, path);
            }

            // 레포 루트
            Pattern repoPattern = Pattern.compile(
                "github\\.com/([^/]+)/([^/]+)$");
            Matcher repoMatcher = repoPattern.matcher(normalized);
            if (repoMatcher.find()) {
                String owner = repoMatcher.group(1);
                String repo  = repoMatcher.group(2);
                return fetchFileContent(owner, repo, "main", "README.md");
            }

            return "[URL 파싱 실패: " + githubUrl + "]";
        } catch (Exception e) {
            log.warn("GitHub fetch 실패: {} - {}", githubUrl, e.getMessage());
            return "[Fetch 실패: " + githubUrl + " - " + e.getMessage() + "]";
        }
    }

    private String fetchFileContent(String owner, String repo, String branch, String path) {
        // Raw 컨텐츠 직접 fetch
        String rawUrl = String.format(
            "https://raw.githubusercontent.com/%s/%s/%s/%s",
            owner, repo, branch, path);

        HttpHeaders headers = buildHeaders();
        try {
            ResponseEntity<String> resp = restTemplate.exchange(
                rawUrl, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            String content = resp.getBody();
            if (content == null) return "[빈 파일]";
            // 최대 300줄로 제한
            String[] lines = content.split("\n");
            if (lines.length > 300) {
                content = String.join("\n", Arrays.copyOf(lines, 300))
                        + "\n... (이하 생략)";
            }
            return content;
        } catch (Exception e) {
            // main 실패 시 master 시도
            if ("main".equals(branch)) {
                return fetchFileContent(owner, repo, "master", path);
            }
            throw e;
        }
    }

    private String fetchDirectoryContents(String owner, String repo,
                                           String branch, String path) {
        String apiUrl = String.format(
            "https://api.github.com/repos/%s/%s/contents/%s?ref=%s",
            owner, repo, path, branch);

        HttpHeaders headers = buildHeaders();
        headers.set("Accept", "application/vnd.github.v3+json");

        try {
            ResponseEntity<List> resp = restTemplate.exchange(
                apiUrl, HttpMethod.GET, new HttpEntity<>(headers), List.class);
            List<Map<String, Object>> items = resp.getBody();
            if (items == null) return "[디렉토리 비어있음]";

            StringBuilder sb = new StringBuilder();
            int count = 0;
            for (Map<String, Object> item : items) {
                if (count >= 15) { // 최대 15개 파일
                    sb.append("\n... (이하 파일 생략)");
                    break;
                }
                String type = (String) item.get("type");
                String filePath = (String) item.get("path");
                String name = (String) item.get("name");
                if (!"file".equals(type)) continue;
                // 소스 파일만 (이미지 등 제외)
                if (!isTextFile(name)) continue;

                sb.append("\n=== ").append(filePath).append(" ===\n");
                sb.append(fetchFileContent(owner, repo, branch, filePath));
                sb.append("\n");
                count++;
            }
            return sb.toString();
        } catch (Exception e) {
            return "[디렉토리 fetch 실패: " + e.getMessage() + "]";
        }
    }

    private boolean isTextFile(String filename) {
        String lower = filename.toLowerCase();
        return lower.endsWith(".java") || lower.endsWith(".ts")
            || lower.endsWith(".tsx") || lower.endsWith(".js")
            || lower.endsWith(".jsx") || lower.endsWith(".yml")
            || lower.endsWith(".yaml") || lower.endsWith(".xml")
            || lower.endsWith(".sql") || lower.endsWith(".md")
            || lower.endsWith(".json") || lower.endsWith(".py")
            || lower.endsWith(".go") || lower.endsWith(".kt");
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        if (githubToken != null && !githubToken.isBlank()) {
            headers.set("Authorization", "token " + githubToken);
        }
        headers.set("User-Agent", "SubutaiAI/1.0");
        return headers;
    }
}
