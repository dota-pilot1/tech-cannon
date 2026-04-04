package com.mapo.palantier.apidoc.dto;

import lombok.Data;

@Data
public class ApiDocBlockDto {
    private String blockType; // NOTE/MMD/FIGMA/FILE/DBTABLE/GITHUB
    private String content;
}
