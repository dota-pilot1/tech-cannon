package com.mapo.palantier.pilot.block;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PilotBlock {
    private Long id;
    private Long postId;
    private PilotBlockType blockType;
    private String content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
