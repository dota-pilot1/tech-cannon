package com.mapo.palantier.prompt.post;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Prompt {
    private Long id;
    private Long folderId;
    private String title;
    private String content;
    private Long authorId;
    private String authorName;
    private Boolean isPinned;
    private String tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
