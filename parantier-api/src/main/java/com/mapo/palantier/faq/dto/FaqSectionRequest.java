package com.mapo.palantier.faq.dto;

import lombok.Data;

@Data
public class FaqSectionRequest {
    private Long categoryId;
    private String title;
    private Integer orderNum;
}
