package com.mapo.palantier.subutai.ai.domain;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SubutaiGithubItem {
    private Long id;
    private Long folderId;
    private String label;
    private String githubUrl;
    private Integer orderNum;
    private LocalDateTime createdAt;
}
