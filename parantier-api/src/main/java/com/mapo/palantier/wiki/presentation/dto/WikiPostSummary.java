package com.mapo.palantier.wiki.presentation.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WikiPostSummary {

    private Long id;
    private Long folderId;
    private String title;
    private Long authorId;
    private String authorName;
    private Boolean isPinned;
    private String tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
