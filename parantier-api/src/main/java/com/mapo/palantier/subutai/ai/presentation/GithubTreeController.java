package com.mapo.palantier.subutai.ai.presentation;

import com.mapo.palantier.subutai.ai.dto.GithubTreeNode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.*;

@Slf4j
@Tag(name = "GitHub Tree", description = "GitHub 레포 트리 조회")
@RestController
@RequestMapping("/api/subutai/github")
@RequiredArgsConstructor
public class GithubTreeController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${github.token:}")
    private String githubToken;

    /**
     * GitHub 레포 URL을 받아 파일 트리를 반환
     * GET /api/subutai/github/tree?url=https://github.com/org/repo
     */
    @Operation(summary = "GitHub 레포 트리 조회")
    @GetMapping("/tree")
    @SuppressWarnings("unchecked")
    public ResponseEntity<List<GithubTreeNode>> getTree(@RequestParam String url) {
        try {
            // URL 파싱: github.com/{owner}/{repo}
            Pattern p = Pattern.compile("github\\.com/([^/]+)/([^/]+?)(\\.git)?$");
            Matcher m = p.matcher(url.trim().replaceAll("/$", ""));
            if (!m.find()) {
                return ResponseEntity.badRequest().build();
            }
            String owner = m.group(1);
            String repo = m.group(2);

            // 기본 브랜치 조회
            String branch = getDefaultBranch(owner, repo);

            // Git Tree API (recursive)
            String treeUrl = String.format(
                "https://api.github.com/repos/%s/%s/git/trees/%s?recursive=1",
                owner, repo, branch
            );

            HttpHeaders headers = buildHeaders();
            headers.set("Accept", "application/vnd.github.v3+json");

            ResponseEntity<Map> resp = restTemplate.exchange(
                treeUrl, HttpMethod.GET, new HttpEntity<>(headers), Map.class
            );

            Map<String, Object> body = resp.getBody();
            if (body == null) return ResponseEntity.ok(List.of());

            List<Map<String, Object>> treeItems = (List<Map<String, Object>>) body.get("tree");
            if (treeItems == null) return ResponseEntity.ok(List.of());

            // 평면 목록 → 트리 구조 변환
            List<GithubTreeNode> tree = buildTree(treeItems, owner, repo, branch);
            return ResponseEntity.ok(tree);

        } catch (Exception e) {
            log.error("GitHub tree 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * 파일 내용 조회
     * GET /api/subutai/github/content?owner=org&repo=repo&path=src/App.java&branch=main
     */
    @Operation(summary = "GitHub 파일 내용 조회")
    @GetMapping("/content")
    public ResponseEntity<String> getContent(
            @RequestParam String owner,
            @RequestParam String repo,
            @RequestParam String path,
            @RequestParam(defaultValue = "main") String branch) {
        try {
            String rawUrl = String.format(
                "https://raw.githubusercontent.com/%s/%s/%s/%s",
                owner, repo, branch, path
            );
            HttpHeaders headers = buildHeaders();
            ResponseEntity<String> resp = restTemplate.exchange(
                rawUrl, HttpMethod.GET, new HttpEntity<>(headers), String.class
            );
            return ResponseEntity.ok(resp.getBody());
        } catch (Exception e) {
            // main 실패 시 master 시도
            if ("main".equals(branch)) {
                try {
                    String rawUrl = String.format(
                        "https://raw.githubusercontent.com/%s/%s/master/%s",
                        owner, repo, path
                    );
                    HttpHeaders headers = buildHeaders();
                    ResponseEntity<String> resp = restTemplate.exchange(
                        rawUrl, HttpMethod.GET, new HttpEntity<>(headers), String.class
                    );
                    return ResponseEntity.ok(resp.getBody());
                } catch (Exception e2) {
                    log.warn("파일 조회 실패 {}: {}", path, e2.getMessage());
                }
            }
            return ResponseEntity.status(404).body("// 파일을 불러올 수 없습니다: " + path);
        }
    }

    @SuppressWarnings("unchecked")
    private String getDefaultBranch(String owner, String repo) {
        try {
            String apiUrl = String.format("https://api.github.com/repos/%s/%s", owner, repo);
            HttpHeaders headers = buildHeaders();
            headers.set("Accept", "application/vnd.github.v3+json");
            ResponseEntity<Map> resp = restTemplate.exchange(
                apiUrl, HttpMethod.GET, new HttpEntity<>(headers), Map.class
            );
            if (resp.getBody() != null) {
                Object b = resp.getBody().get("default_branch");
                if (b instanceof String) return (String) b;
            }
        } catch (Exception e) {
            log.debug("기본 브랜치 조회 실패: {}", e.getMessage());
        }
        return "main";
    }

    @SuppressWarnings("unchecked")
    private List<GithubTreeNode> buildTree(
            List<Map<String, Object>> items,
            String owner, String repo, String branch) {

        // path → node 맵
        Map<String, GithubTreeNode> nodeMap = new LinkedHashMap<>();

        for (Map<String, Object> item : items) {
            String path = (String) item.get("path");
            String type = (String) item.get("type");
            if (path == null || type == null) continue;

            String name = path.contains("/")
                ? path.substring(path.lastIndexOf('/') + 1)
                : path;

            String githubUrl = String.format(
                "https://github.com/%s/%s/%s/%s/%s",
                owner, repo,
                "blob".equals(type) ? "blob" : "tree",
                branch, path
            );

            GithubTreeNode node = GithubTreeNode.builder()
                .path(path)
                .name(name)
                .type(type)
                .url(githubUrl)
                .children("tree".equals(type) ? new ArrayList<>() : null)
                .build();

            nodeMap.put(path, node);
        }

        // 부모-자식 관계 설정
        List<GithubTreeNode> roots = new ArrayList<>();
        for (GithubTreeNode node : nodeMap.values()) {
            String path = node.getPath();
            int lastSlash = path.lastIndexOf('/');
            if (lastSlash < 0) {
                roots.add(node);
            } else {
                String parentPath = path.substring(0, lastSlash);
                GithubTreeNode parent = nodeMap.get(parentPath);
                if (parent != null && parent.getChildren() != null) {
                    parent.getChildren().add(node);
                } else {
                    roots.add(node);
                }
            }
        }

        // 각 레벨: 폴더 먼저, 그 다음 파일 (알파벳 순)
        sortNodes(roots);
        return roots;
    }

    private void sortNodes(List<GithubTreeNode> nodes) {
        if (nodes == null) return;
        nodes.sort((a, b) -> {
            boolean aIsDir = "tree".equals(a.getType());
            boolean bIsDir = "tree".equals(b.getType());
            if (aIsDir != bIsDir) return aIsDir ? -1 : 1;
            return a.getName().compareToIgnoreCase(b.getName());
        });
        for (GithubTreeNode node : nodes) {
            sortNodes(node.getChildren());
        }
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
