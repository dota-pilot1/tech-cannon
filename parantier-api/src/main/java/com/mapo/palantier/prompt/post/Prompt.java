package com.mapo.palantier.prompt.post;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
