package com.mapo.palantier.task.dto;

import com.mapo.palantier.task.block.BlockType;
import lombok.Data;

@Data
public class TaskBlockDto {
    private BlockType blockType;
    private String content;
}
