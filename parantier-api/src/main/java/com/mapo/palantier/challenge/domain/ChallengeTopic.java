package com.mapo.palantier.challenge.domain;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeTopic {
    private Long id;
    private Long sectionId;
    private String blockType;
    private String content;
    private Integer sortOrder;
    private Long updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
