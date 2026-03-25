package com.palantier.domain.task.dto;

import lombok.Data;

@Data
public class TaskCommentDto {
    private Long postId;
    private String content;
}
