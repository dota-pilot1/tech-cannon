package com.mapo.palantier.figma.dto;

import lombok.Data;

@Data
public class FigmaCategoryRequest {
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
}
