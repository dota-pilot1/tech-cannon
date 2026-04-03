package com.mapo.palantier.architecture.dto;

import lombok.Data;

@Data
public class BlockDto {
    private String blockType; // NOTE/MMD/FIGMA/FILE/DBTABLE/GITHUB
    private String content;
}
