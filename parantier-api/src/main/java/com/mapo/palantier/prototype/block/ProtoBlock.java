package com.mapo.palantier.prototype.block;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProtoBlock {
    private Long id;
    private Long postId;
    private ProtoBlockType blockType;
    private String content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
