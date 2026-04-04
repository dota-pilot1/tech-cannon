package com.mapo.palantier.frontend.dto;

import lombok.Data;

@Data
public class FrontendCategoryRequest {
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
}
