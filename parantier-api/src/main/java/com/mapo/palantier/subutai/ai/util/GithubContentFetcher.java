package com.mapo.palantier.subutai.ai.util;

import java.util.*;
import java.util.regex.*;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class GithubContentFetcher {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${github.token:}")
    private String githubToken;

    // 레포 루트 URL 시 직접 탐색할 소스 디렉토리 (순서대로 시도)
    private static final List<String> TARGET_SOURCE_DIRS = List.of(
        "parantier-api/src/main/java",
        "parantier-front/src",
        "src/main/java",
        "src"
    );

    private static final List<String> PRIORITY_DIRS = List.of(
        "parantier-api/src/main/java",
        "parantier-front/src",
        "src/main/java",
        "src/main/resources/mybatis",
        "src",
        "backend/src",
        "frontend/src",
        "api/src",
        "app/src",
        "server/src"
    );

    private static final int MAX_FILES_PER_DIR = 20; // 디렉토리별 최대 파일 수
    private static final int MAX_FILES = 40; // 레포 전체 탐색 시 최대 파일 수
    private static final int MAX_LINES = 150; // 파일당 최대 줄 수

    /**
     * GitHub URL 형식 지원:
     *  - blob  : github.com/{owner}/{repo}/blob/{branch}/{path}  → 단일 파일
     *  - tree  : github.com/{owner}/{repo}/tree/{branch}/{path}  → 디렉토리
     *  - repo  : github.com/{owner}/{repo}                       → 레포 전체 (Tree API)
     */
    public String fetchContent(String githubUrl) {
        try {
            String normalized = githubUrl.trim().replaceAll("/$", "");

            // blob → 단일 파일
            Pattern blobPattern = Pattern.compile(
                "github\\.com/([^/]+)/([^/]+)/blob/([^/]+)/(.+)"
            );
            Matcher blobMatcher = blobPattern.matcher(normalized);
            if (blobMatcher.find()) {
                return fetchFileContent(
                    blobMatcher.group(1),
                    blobMatcher.group(2),
                    blobMatcher.group(3),
                    blobMatcher.group(4)
                );
            }

            // tree → 디렉토리
            Pattern treePattern = Pattern.compile(
                "github\\.com/([^/]+)/([^/]+)/tree/([^/]+)/(.+)"
            );
            Matcher treeMatcher = treePattern.matcher(normalized);
            if (treeMatcher.find()) {
                return fetchDirectoryContents(
                    treeMatcher.group(1),
                    treeMatcher.group(2),
                    treeMatcher.group(3),
                    treeMatcher.group(4)
                );
            }

            // 레포 루트 → 소스 디렉토리 직접 타겟팅
            Pattern repoPattern = Pattern.compile(
                "github\\.com/([^/]+)/([^/]+)$"
            );
            Matcher repoMatcher = repoPattern.matcher(normalized);
            if (repoMatcher.find()) {
                return fetchRepoContents(
                    repoMatcher.group(1),
                    repoMatcher.group(2)
                );
            }

            return "[URL 파싱 실패: " + githubUrl + "]";
        } catch (Exception e) {
            log.warn("GitHub fetch 실패: {} - {}", githubUrl, e.getMessage());
            return "[Fetch 실패: " + githubUrl + " - " + e.getMessage() + "]";
        }
    }

    // ── 레포 전체: Git Tree API 사용 ─────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private String fetchRepoContents(String owner, String repo) {
        // 1) 기본 브랜치 확인
        String branch = getDefaultBranch(owner, repo);

        // 2) Git Tree API (recursive) → 전체 파일 목록
        String treeUrl = String.format(
            "https://api.github.com/repos/%s/%s/git/trees/%s?recursive=1",
            owner,
            repo,
            branch
        );

        HttpHeaders headers = buildHeaders();
        headers.set("Accept", "application/vnd.github.v3+json");

        List<Map<String, Object>> allFiles;
        try {
            ResponseEntity<Map> resp = restTemplate.exchange(
                treeUrl,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
            );
            Map<String, Object> body = resp.getBody();
            if (body == null) return "[Tree API 응답 없음]";
            allFiles = (List<Map<String, Object>>) body.get("tree");
            if (allFiles == null) return "[파일 목록 없음]";
        } catch (Exception e) {
            log.warn("Tree API 실패 ({}/{}): {}", owner, repo, e.getMessage());
            // 실패 시 README만 반환
            return fetchFileContent(owner, repo, branch, "README.md");
        }

        // 3) 소스 파일만 필터링 (blob 타입 + 텍스트 확장자)
        List<String> sourcePaths = allFiles
            .stream()
            .filter(f -> "blob".equals(f.get("type")))
            .map(f -> (String) f.get("path"))
            .filter(p -> p != null && isSourceFile(p))
            .filter(p -> !isIgnoredPath(p))
            .collect(Collectors.toList());

        // 4) 우선순위 정렬 (주요 소스 디렉토리 우선)
        sourcePaths.sort((a, b) -> {
            int pa = pathPriority(a);
            int pb = pathPriority(b);
            if (pa != pb) return Integer.compare(pa, pb);
            return Integer.compare(a.length(), b.length()); // 짧은 경로 우선
        });

        // 5) 최대 MAX_FILES개 파일 내용 fetch
        StringBuilder sb = new StringBuilder();
        sb
            .append("=== 레포지토리: ")
            .append(owner)
            .append("/")
            .append(repo)
            .append(" (branch: ")
            .append(branch)
            .append(") ===\n\n");

        // README 먼저
        sourcePaths
            .stream()
            .filter(p -> p.equalsIgnoreCase("README.md"))
            .findFirst()
            .ifPresent(p -> {
                sb.append("=== ").append(p).append(" ===\n");
                sb
                    .append(fetchFileContent(owner, repo, branch, p))
                    .append("\n\n");
            });

        int count = 0;
        for (String path : sourcePaths) {
            if (count >= MAX_FILES) {
                sb
                    .append("\n... (총 ")
                    .append(sourcePaths.size())
                    .append("개 중 ")
                    .append(MAX_FILES)
                    .append("개만 표시)\n");
                break;
            }
            if (path.equalsIgnoreCase("README.md")) continue; // 이미 추가함

            sb.append("=== ").append(path).append(" ===\n");
            sb
                .append(fetchFileContent(owner, repo, branch, path))
                .append("\n\n");
            count++;
        }

        log.info("레포 {} 파일 {}개 fetch 완료", repo, count);
        return sb.toString();
    }

    private String getDefaultBranch(String owner, String repo) {
        try {
            String apiUrl = String.format(
                "https://api.github.com/repos/%s/%s",
                owner,
                repo
            );
            HttpHeaders headers = buildHeaders();
            headers.set("Accept", "application/vnd.github.v3+json");
            ResponseEntity<Map> resp = restTemplate.exchange(
                apiUrl,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
            );
            if (resp.getBody() != null) {
                Object branch = resp.getBody().get("default_branch");
                if (branch instanceof String) return (String) branch;
            }
        } catch (Exception e) {
            log.debug("기본 브랜치 조회 실패, main 사용: {}", e.getMessage());
        }
        return "main";
    }

    private int pathPriority(String path) {
        for (int i = 0; i < PRIORITY_DIRS.size(); i++) {
            if (path.startsWith(PRIORITY_DIRS.get(i))) return i;
        }
        return PRIORITY_DIRS.size();
    }

    private boolean isIgnoredPath(String path) {
        String lower = path.toLowerCase();

        // 경로에 포함되면 제외
        if (
            lower.contains("node_modules/") ||
            lower.contains(".git/") ||
            lower.contains("build/") ||
            lower.contains("dist/") ||
            lower.contains("out/") ||
            lower.contains(".gradle/") ||
            lower.contains("__pycache__/") ||
            lower.contains(".min.") ||
            lower.endsWith(".map") ||
            lower.endsWith(".png") ||
            lower.endsWith(".jpg") ||
            lower.endsWith(".ico") ||
            lower.endsWith(".svg") ||
            lower.endsWith(".woff") ||
            lower.endsWith(".woff2") ||
            lower.endsWith(".ttf")
        ) {
            return true;
        }

        // docs 폴더, 문서 전용 경로 제외
        String[] segments = lower.split("/");
        for (String seg : segments) {
            if (
                seg.startsWith("docs") ||
                seg.startsWith("doc-") ||
                seg.startsWith("docs-") ||
                seg.equals("doc")
            ) {
                return true;
            }
        }

        // 루트 레벨 스크립트/설정 파일 제외 (경로에 / 없으면 루트)
        if (!path.contains("/")) {
            return (
                lower.endsWith(".sh") ||
                lower.endsWith(".md") ||
                lower.endsWith(".txt") ||
                lower.equals(".gitignore") ||
                lower.equals("gradlew") ||
                lower.equals("gradlew.bat")
            );
        }

        return false;
    }

    // ── 단일 파일 ──────────────────────────────────────────────────────────────

    private String fetchFileContent(
        String owner,
        String repo,
        String branch,
        String path
    ) {
        String rawUrl = String.format(
            "https://raw.githubusercontent.com/%s/%s/%s/%s",
            owner,
            repo,
            branch,
            path
        );

        HttpHeaders headers = buildHeaders();
        try {
            ResponseEntity<String> resp = restTemplate.exchange(
                rawUrl,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class
            );
            String content = resp.getBody();
            if (content == null) return "[빈 파일]";

            String[] lines = content.split("\n");
            if (lines.length > MAX_LINES) {
                content =
                    String.join("\n", Arrays.copyOf(lines, MAX_LINES)) +
                    "\n... (이하 " +
                    (lines.length - MAX_LINES) +
                    "줄 생략)";
            }
            return content;
        } catch (Exception e) {
            if ("main".equals(branch)) {
                try {
                    return fetchFileContent(owner, repo, "master", path);
                } catch (Exception e2) {
                    log.debug(
                        "파일 fetch 실패 {}/{}: {}",
                        repo,
                        path,
                        e2.getMessage()
                    );
                }
            }
            return "[파일 fetch 실패: " + path + "]";
        }
    }

    // ── 디렉토리 ───────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private String fetchDirectoryContents(
        String owner,
        String repo,
        String branch,
        String path
    ) {
        String apiUrl = String.format(
            "https://api.github.com/repos/%s/%s/contents/%s?ref=%s",
            owner,
            repo,
            path,
            branch
        );

        HttpHeaders headers = buildHeaders();
        headers.set("Accept", "application/vnd.github.v3+json");

        try {
            ResponseEntity<List> resp = restTemplate.exchange(
                apiUrl,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                List.class
            );
            List<Map<String, Object>> items = resp.getBody();
            if (items == null) return "[디렉토리 비어있음]";

            StringBuilder sb = new StringBuilder();
            int count = 0;
            for (Map<String, Object> item : items) {
                if (count >= 20) {
                    sb.append("\n... (이하 파일 생략)");
                    break;
                }
                if (!"file".equals(item.get("type"))) continue;
                String filePath = (String) item.get("path");
                String name = (String) item.get("name");
                if (name == null || !isTextFile(name)) continue;

                sb.append("\n=== ").append(filePath).append(" ===\n");
                sb
                    .append(fetchFileContent(owner, repo, branch, filePath))
                    .append("\n");
                count++;
            }
            return sb.toString();
        } catch (Exception e) {
            return "[디렉토리 fetch 실패: " + e.getMessage() + "]";
        }
    }

    // ── 유틸 ──────────────────────────────────────────────────────────────────

    /**
     * 소스 파일 여부 (레포 전체 탐색 시 — 실제 코드 파일만)
     * docs, md 등 문서 파일 제외
     */
    private boolean isSourceFile(String path) {
        String lower = path.toLowerCase();
        // 실제 소스 코드 확장자만
        return (
            lower.endsWith(".java") ||
            lower.endsWith(".ts") ||
            lower.endsWith(".tsx") ||
            lower.endsWith(".js") ||
            lower.endsWith(".jsx") ||
            lower.endsWith(".kt") ||
            lower.endsWith(".py") ||
            lower.endsWith(".go") ||
            lower.endsWith(".xml") ||
            lower.endsWith(".yml") ||
            lower.endsWith(".yaml") ||
            lower.endsWith(".sql") ||
            lower.endsWith(".gradle") ||
            lower.endsWith(".properties")
        );
    }

    /**
     * 디렉토리 탐색용 텍스트 파일 여부 (단일/디렉토리 URL)
     */
    private boolean isTextFile(String filename) {
        String lower = filename.toLowerCase();
        return (
            lower.endsWith(".java") ||
            lower.endsWith(".ts") ||
            lower.endsWith(".tsx") ||
            lower.endsWith(".js") ||
            lower.endsWith(".jsx") ||
            lower.endsWith(".yml") ||
            lower.endsWith(".yaml") ||
            lower.endsWith(".xml") ||
            lower.endsWith(".sql") ||
            lower.endsWith(".md") ||
            lower.endsWith(".py") ||
            lower.endsWith(".go") ||
            lower.endsWith(".kt") ||
            lower.endsWith(".gradle") ||
            lower.endsWith(".properties")
        );
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
