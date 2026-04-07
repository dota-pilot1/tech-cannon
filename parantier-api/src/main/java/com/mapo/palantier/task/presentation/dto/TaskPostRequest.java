package com.mapo.palantier.task.presentation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TaskPostRequest {

    private Long id;

    @NotNull(message = "폴더를 선택해주세요")
    private Long folderId;

    @NotBlank(message = "제목을 입력해주세요")
    private String title;

    @Valid
    private List<TaskBlockRequest> blocks;
}
