package com.mapo.palantier.wiki.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class WikiPostRequest {

    private Long id;

    @NotNull(message = "폴더를 선택해주세요")
    private Long folderId;

    @NotBlank(message = "제목을 입력해주세요")
    private String title;

    private Boolean isPinned;
    private List<String> tags;
    private List<WikiBlockRequest> blocks;
}
