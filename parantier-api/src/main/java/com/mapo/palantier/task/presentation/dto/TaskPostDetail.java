package com.mapo.palantier.task.presentation.dto;

import com.mapo.palantier.task.domain.TaskBlock;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TaskPostDetail {

    private Long id;
    private Long folderId;
    private String title;
    private Long authorId;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TaskBlock> blocks;
}
