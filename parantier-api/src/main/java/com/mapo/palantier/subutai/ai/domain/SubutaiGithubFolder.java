package com.mapo.palantier.subutai.ai.domain;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class SubutaiGithubFolder {
    private Long id;
    private String name;
    private Integer orderNum;
    private Long createdBy;
    private LocalDateTime createdAt;
    private List<SubutaiGithubItem> items = new ArrayList<>();
}
