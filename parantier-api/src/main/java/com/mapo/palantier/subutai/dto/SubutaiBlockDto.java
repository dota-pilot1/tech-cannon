package com.mapo.palantier.subutai.dto;

import com.mapo.palantier.subutai.block.SubutaiBlockType;
import lombok.Data;

@Data
public class SubutaiBlockDto {
    private SubutaiBlockType blockType;
    private String content;
}
