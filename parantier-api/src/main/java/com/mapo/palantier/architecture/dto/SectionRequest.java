package com.mapo.palantier.architecture.dto;

import lombok.Data;

@Data
public class SectionRequest {
    private Long categoryId;
    private String title;
    private Integer orderNum;
}
