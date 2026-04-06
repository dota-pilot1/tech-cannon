package com.mapo.palantier.subutai.faq.dto;

import lombok.Data;

@Data
public class SubutaiFaqBlockDto {
    private String blockType; // NOTE/MMD/FIGMA/FILE/DBTABLE/GITHUB/QUESTION/ANSWER
    private String content;
}
