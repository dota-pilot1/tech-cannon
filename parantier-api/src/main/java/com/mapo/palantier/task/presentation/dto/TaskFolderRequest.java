package com.mapo.palantier.task.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TaskFolderRequest {

    private Long id;
    private Long parentId;

    @NotBlank(message = "폴더명을 입력해주세요")
    private String name;

    private Integer sortOrder;
}
