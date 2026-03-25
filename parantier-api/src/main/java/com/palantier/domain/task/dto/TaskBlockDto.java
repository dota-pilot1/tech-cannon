package com.palantier.domain.task.dto;

import com.palantier.domain.task.block.BlockType;
import lombok.Data;

@Data
public class TaskBlockDto {
    private BlockType blockType;
    private String content;
}
