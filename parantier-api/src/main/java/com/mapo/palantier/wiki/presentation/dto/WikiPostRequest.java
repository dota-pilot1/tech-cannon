package com.mapo.palantier.wiki.presentation.dto;

import com.mapo.palantier.wiki.domain.WikiBlockType;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class WikiPostRequest {
    private Long id;
    private Long folderId;
    private String title;
    private Boolean isPinned;
    private List<String> tags;
    private List<WikiBlockRequest> blocks;
}
