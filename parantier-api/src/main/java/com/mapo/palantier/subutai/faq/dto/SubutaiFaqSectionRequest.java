package com.mapo.palantier.subutai.faq.dto;

import lombok.Data;

@Data
public class SubutaiFaqSectionRequest {
    private Long categoryId;
    private String title;
    private Integer orderNum;
}
