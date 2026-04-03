package com.mapo.palantier.architecture.dto;

import lombok.Data;

@Data
public class CategoryRequest {
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
}
