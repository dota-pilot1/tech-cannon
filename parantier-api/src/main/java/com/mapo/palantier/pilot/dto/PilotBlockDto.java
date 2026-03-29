package com.mapo.palantier.pilot.dto;

import com.mapo.palantier.pilot.block.PilotBlockType;
import lombok.Data;

@Data
public class PilotBlockDto {
    private PilotBlockType blockType;
    private String content;
}
