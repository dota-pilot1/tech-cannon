package com.mapo.palantier.textbook.dto;

import lombok.Data;

@Data
public class TextbookCategoryRequest {
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
}
