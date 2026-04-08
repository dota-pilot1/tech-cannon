package com.mapo.palantier.challenge.dto;

import lombok.Data;

@Data
public class ChallengeCategoryRequest {
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
}
