package com.mapo.palantier.task.dto;

import lombok.Data;

@Data
public class TaskFolderDto {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
}
