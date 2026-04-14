package com.mapo.palantier.prototypev2.dto;

import lombok.Data;

@Data
public class PrototypeCategoryRequest {
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
}
