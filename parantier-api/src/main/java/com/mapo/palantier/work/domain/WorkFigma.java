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
public class WorkFigma {
    private Long id;
    private Long workId;
    private String title;
    private String url;
    private String description;
    private Integer orderNum;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
