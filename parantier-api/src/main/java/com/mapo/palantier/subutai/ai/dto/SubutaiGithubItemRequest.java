package com.mapo.palantier.subutai.ai.dto;

import lombok.Data;

@Data
public class SubutaiGithubItemRequest {
    private Long folderId;
    private String label;
    private String githubUrl;
}
