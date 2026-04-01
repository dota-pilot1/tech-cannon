package com.mapo.palantier.wiki.dto;

import com.mapo.palantier.wiki.block.WikiBlockType;
import lombok.Data;

@Data
public class WikiBlockDto {
    private WikiBlockType blockType;
    private String content;
}
