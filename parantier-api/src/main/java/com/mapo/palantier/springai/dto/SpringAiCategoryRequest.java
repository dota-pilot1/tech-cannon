package com.mapo.palantier.springai.dto;

import lombok.Data;

@Data
public class SpringAiCategoryRequest {
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
}
