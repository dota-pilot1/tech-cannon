package com.mapo.palantier.task.presentation.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TaskCommentRequest {
    private Long postId;
    private String content;
}
