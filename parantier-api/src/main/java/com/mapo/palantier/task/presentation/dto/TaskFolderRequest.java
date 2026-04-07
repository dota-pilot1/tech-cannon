package com.mapo.palantier.task.presentation.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TaskFolderRequest {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
}
