package com.mapo.palantier.skillcore.dto;

import lombok.Data;

@Data
public class SkillCoreCategoryRequest {
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
}
