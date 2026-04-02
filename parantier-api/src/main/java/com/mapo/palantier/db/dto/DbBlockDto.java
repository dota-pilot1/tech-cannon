package com.mapo.palantier.db.dto;

import com.mapo.palantier.db.block.DbBlockType;
import lombok.Data;

@Data
public class DbBlockDto {
    private DbBlockType blockType;
    private String content;
}
