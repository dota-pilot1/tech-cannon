package com.mapo.palantier.prompt.folder;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PromptFolder {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
