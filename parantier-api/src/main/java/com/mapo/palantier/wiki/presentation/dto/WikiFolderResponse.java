package com.mapo.palantier.wiki.presentation.dto;

import com.mapo.palantier.wiki.domain.WikiFolder;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WikiFolderResponse {

    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WikiFolderResponse from(WikiFolder folder) {
        return WikiFolderResponse.builder()
            .id(folder.getId())
            .parentId(folder.getParentId())
            .name(folder.getName())
            .sortOrder(folder.getSortOrder())
            .createdBy(folder.getCreatedBy())
            .createdAt(folder.getCreatedAt())
            .updatedAt(folder.getUpdatedAt())
            .build();
    }
}
