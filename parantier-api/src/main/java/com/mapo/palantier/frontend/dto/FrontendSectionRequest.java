package com.mapo.palantier.frontend.dto;

import lombok.Data;

@Data
public class FrontendSectionRequest {
    private Long categoryId;
    private String title;
    private Integer orderNum;
}
