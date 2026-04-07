package com.mapo.palantier.memo.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MemoRequest {

    @NotBlank(message = "제목을 입력해주세요")
    private String title;

    private String content;
    private Integer sortOrder;
}
