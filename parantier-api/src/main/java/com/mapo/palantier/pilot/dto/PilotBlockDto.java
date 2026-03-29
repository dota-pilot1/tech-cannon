package com.mapo.palantier.pilot.dto;

import com.mapo.palantier.pilot.block.BlockType;
import lombok.Data;

@Data
public class PilotBlockDto {
    private BlockType blockType;
    private String content;
}
