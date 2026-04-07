package com.mapo.palantier.task.presentation.dto;

import com.mapo.palantier.task.domain.BlockType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TaskBlockRequest {

    @NotNull(message = "블록 타입은 필수입니다")
    private BlockType blockType;

    private String content;
}
