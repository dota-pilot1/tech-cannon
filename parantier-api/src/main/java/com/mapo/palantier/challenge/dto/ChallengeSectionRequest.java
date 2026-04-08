package com.mapo.palantier.challenge.dto;

import lombok.Data;

@Data
public class ChallengeSectionRequest {
    private Long categoryId;
    private String title;
    private Integer orderNum;
}
