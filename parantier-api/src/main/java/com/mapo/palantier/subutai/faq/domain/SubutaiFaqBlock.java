package com.mapo.palantier.subutai.faq.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubutaiFaqBlock {
    private Long id;
    private Long sectionId;
    private String blockType; // NOTE/MMD/FIGMA/FILE/DBTABLE/GITHUB/QUESTION/ANSWER
    private String content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long updatedBy;
}
