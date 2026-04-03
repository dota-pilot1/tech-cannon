package com.mapo.palantier.faq.dto;

import lombok.Data;

@Data
public class FaqBlockDto {
    private String blockType; // NOTE/MMD/FIGMA/FILE/DBTABLE/GITHUB/QUESTION/ANSWER
    private String content;
}
