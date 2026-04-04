package com.mapo.palantier.frontend.dto;

import lombok.Data;

@Data
public class FrontendBlockDto {
    private String blockType; // NOTE/MMD/FIGMA/FILE/DBTABLE/GITHUB
    private String content;
}
