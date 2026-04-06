package com.mapo.palantier.subutai.faq.dto;

import lombok.Data;

@Data
public class SubutaiFaqCategoryRequest {
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
}
