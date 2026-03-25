package com.mapo.palantier.task.dto;

import lombok.Data;

@Data
public class TaskCommentDto {
    private Long postId;
    private String content;
}
