package com.mapo.palantier.wiki.dto;

import lombok.Data;
import java.util.List;

@Data
public class WikiPostDto {
    private Long id;
    private Long folderId;
    private String title;
    private Boolean isPinned;
    private List<String> tags;
    private List<WikiBlockDto> blocks;
}
