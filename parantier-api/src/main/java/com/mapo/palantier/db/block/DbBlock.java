package com.mapo.palantier.db.block;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DbBlock {
    private Long id;
    private Long postId;
    private DbBlockType blockType;
    private String content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
