package com.mapo.palantier.wiki.dto;

import lombok.Data;

@Data
public class WikiFolderDto {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
}
