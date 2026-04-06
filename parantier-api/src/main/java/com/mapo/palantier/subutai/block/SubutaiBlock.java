package com.mapo.palantier.subutai.block;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubutaiBlock {
    private Long id;
    private Long postId;
    private SubutaiBlockType blockType;
    private String content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
