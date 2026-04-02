package com.mapo.palantier.db.folder;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DbFolder {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
