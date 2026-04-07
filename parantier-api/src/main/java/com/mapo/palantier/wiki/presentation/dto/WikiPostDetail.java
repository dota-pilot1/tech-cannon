package com.mapo.palantier.wiki.presentation.dto;

import com.mapo.palantier.wiki.domain.WikiBlock;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WikiPostDetail {

    private Long id;
    private Long folderId;
    private String title;
    private Long authorId;
    private String authorName;
    private Boolean isPinned;
    private String tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<WikiBlock> blocks;
}
