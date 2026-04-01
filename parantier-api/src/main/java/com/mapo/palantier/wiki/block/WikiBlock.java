package com.mapo.palantier.wiki.block;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WikiBlock {
    private Long id;
    private Long postId;
    private WikiBlockType blockType;
    private String content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
