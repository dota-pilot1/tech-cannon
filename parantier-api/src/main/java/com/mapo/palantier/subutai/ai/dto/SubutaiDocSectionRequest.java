package com.mapo.palantier.subutai.ai.dto;

import lombok.Data;

@Data
public class SubutaiDocSectionRequest {
    private Long id;
    private String title;
    private String content;
    private Integer orderNum;
}
