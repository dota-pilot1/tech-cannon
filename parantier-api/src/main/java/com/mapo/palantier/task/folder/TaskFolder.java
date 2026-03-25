package com.mapo.palantier.task.folder;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskFolder {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
