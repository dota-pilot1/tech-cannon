package com.mapo.palantier.subutai.ai.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GithubTreeNode {
    private String path;       // 전체 경로 (예: src/main/java/App.java)
    private String name;       // 파일/폴더명 (예: App.java)
    private String type;       // "blob" (파일) or "tree" (폴더)
    private String url;        // GitHub 원본 URL
    private List<GithubTreeNode> children; // 폴더인 경우 하위 목록
}
