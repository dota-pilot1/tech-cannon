package com.mapo.palantier.skillcore.domain;
import lombok.*;
import java.time.LocalDateTime;
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class SkillCoreBlock {
    private Long id;
    private Long sectionId;
    private String blockType;
    private String content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long updatedBy;
}
