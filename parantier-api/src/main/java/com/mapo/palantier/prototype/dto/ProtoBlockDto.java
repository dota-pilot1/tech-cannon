package com.mapo.palantier.prototype.dto;

import com.mapo.palantier.prototype.block.ProtoBlockType;
import lombok.Data;

@Data
public class ProtoBlockDto {
    private ProtoBlockType blockType;
    private String content;
}
