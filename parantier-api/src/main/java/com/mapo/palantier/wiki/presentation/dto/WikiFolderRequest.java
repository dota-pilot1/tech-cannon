package com.mapo.palantier.wiki.presentation.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class WikiFolderRequest {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
}
