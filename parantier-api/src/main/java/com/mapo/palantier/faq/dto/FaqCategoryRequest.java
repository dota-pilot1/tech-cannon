package com.mapo.palantier.faq.dto;

import lombok.Data;

@Data
public class FaqCategoryRequest {
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
}
