package com.mapo.palantier.wiki.presentation.dto;

import com.mapo.palantier.wiki.domain.WikiBlock;
import com.mapo.palantier.wiki.domain.WikiBlockType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WikiBlockResponse {

    private Long id;
    private Long postId;
    private WikiBlockType blockType;
    private String content;
    private Integer sortOrder;

    public static WikiBlockResponse from(WikiBlock block) {
        return WikiBlockResponse.builder()
                .id(block.getId())
                .postId(block.getPostId())
                .blockType(block.getBlockType())
                .content(block.getContent())
                .sortOrder(block.getSortOrder())
                .build();
    }
}
