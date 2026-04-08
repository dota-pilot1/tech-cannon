package com.mapo.palantier.security.dto;

import lombok.Data;

@Data
public class SecurityCategoryRequest {
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
}
