package com.mapo.palantier.task.dto;

import lombok.Data;
import java.util.List;

@Data
public class TaskPostDto {
    private Long id;
    private Long folderId;
    private String title;
    private List<TaskBlockDto> blocks;
}
