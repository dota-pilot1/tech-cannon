package com.mapo.palantier.core.dto;

import lombok.Data;

@Data
public class CoreCategoryRequest {
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
}
