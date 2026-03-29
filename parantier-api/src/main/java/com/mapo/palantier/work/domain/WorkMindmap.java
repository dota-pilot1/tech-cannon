package com.mapo.palantier.work.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkMindmap {
    private Long id;
    private Long workId;
    private String title;
    private String content;
    private Integer orderNum;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
