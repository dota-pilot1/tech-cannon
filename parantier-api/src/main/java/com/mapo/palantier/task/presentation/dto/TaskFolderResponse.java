package com.mapo.palantier.task.presentation.dto;

import com.mapo.palantier.task.domain.TaskFolder;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TaskFolderResponse {

    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaskFolderResponse from(TaskFolder folder) {
        return TaskFolderResponse.builder()
                .id(folder.getId())
                .parentId(folder.getParentId())
                .name(folder.getName())
                .sortOrder(folder.getSortOrder())
                .createdBy(folder.getCreatedBy())
                .createdAt(folder.getCreatedAt())
                .updatedAt(folder.getUpdatedAt())
                .build();
    }
}
