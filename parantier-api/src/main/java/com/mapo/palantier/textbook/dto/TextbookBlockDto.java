package com.mapo.palantier.textbook.dto;

import lombok.Data;

@Data
public class TextbookBlockDto {
    private String blockType; // NOTE/MMD/FIGMA/FILE/DBTABLE/GITHUB
    private String content;
}
