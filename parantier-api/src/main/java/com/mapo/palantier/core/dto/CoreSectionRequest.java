package com.mapo.palantier.core.dto;

import lombok.Data;

@Data
public class CoreSectionRequest {
    private Long categoryId;
    private String title;
    private Integer orderNum;
}
