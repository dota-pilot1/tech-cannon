package com.mapo.palantier.apidoc.dto;

import lombok.Data;

@Data
public class ApiDocCategoryRequest {
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
}
