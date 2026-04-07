package com.mapo.palantier.figma.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter

@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FigmaLink {
    private Long id;
    private Long categoryId;
    private String title;
    private String url;
    private Integer orderNum;
    private LocalDateTime createdAt;
}
