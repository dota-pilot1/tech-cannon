package com.mapo.palantier.task.presentation.dto;

import com.mapo.palantier.task.domain.BlockType;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TaskBlockRequest {
    private BlockType blockType;
    private String content;
}
