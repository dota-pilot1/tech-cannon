package com.mapo.palantier.task.presentation.dto;

import com.mapo.palantier.task.domain.BlockType;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class TaskPostRequest {
    private Long id;
    private Long folderId;
    private String title;
    private List<TaskBlockRequest> blocks;
}
