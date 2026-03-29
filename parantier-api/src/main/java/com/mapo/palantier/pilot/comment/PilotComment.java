package com.mapo.palantier.pilot.comment;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PilotComment {
    private Long id;
    private Long postId;
    private Long authorId;
    private String authorName; // JOIN으로 가져옴
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
