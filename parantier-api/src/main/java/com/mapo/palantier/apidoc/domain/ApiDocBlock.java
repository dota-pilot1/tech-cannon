package com.mapo.palantier.apidoc.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiDocBlock {
    private Long id;
    private Long sectionId;
    private String blockType; // NOTE/MMD/FIGMA/FILE/DBTABLE/GITHUB
    private String content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long updatedBy;
}
