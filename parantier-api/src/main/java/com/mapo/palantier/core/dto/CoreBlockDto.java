package com.mapo.palantier.core.dto;

import lombok.Data;

@Data
public class CoreBlockDto {
    private String blockType; // NOTE/MMD/FIGMA/FILE/DBTABLE/GITHUB
    private String content;
}
