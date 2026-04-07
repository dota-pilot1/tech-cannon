package com.mapo.palantier.wiki.presentation.dto;

import com.mapo.palantier.wiki.domain.WikiBlockType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class WikiBlockRequest {

    @NotNull(message = "블록 타입은 필수입니다")
    private WikiBlockType blockType;

    private String content;
}
