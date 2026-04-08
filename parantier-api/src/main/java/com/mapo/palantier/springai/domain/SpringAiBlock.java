package com.mapo.palantier.springai.domain;
import lombok.*;
import java.time.LocalDateTime;
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class SpringAiBlock {
    private Long id;
    private Long sectionId;
    private String blockType;
    private String content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long updatedBy;
}
