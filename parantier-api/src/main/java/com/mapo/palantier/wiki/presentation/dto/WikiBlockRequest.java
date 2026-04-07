package com.mapo.palantier.wiki.presentation.dto;

import com.mapo.palantier.wiki.domain.WikiBlockType;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class WikiBlockRequest {
    private WikiBlockType blockType;
    private String content;
}
