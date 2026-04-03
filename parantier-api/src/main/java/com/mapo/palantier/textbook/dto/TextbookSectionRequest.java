package com.mapo.palantier.textbook.dto;

import lombok.Data;

@Data
public class TextbookSectionRequest {
    private Long categoryId;
    private String title;
    private Integer orderNum;
}
