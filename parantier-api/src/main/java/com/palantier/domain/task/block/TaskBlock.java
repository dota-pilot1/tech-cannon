package com.palantier.domain.task.block;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskBlock {
    private Long id;
    private Long postId;
    private BlockType blockType;
    private String content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
