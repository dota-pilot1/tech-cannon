package com.mapo.palantier.hackathon.domain;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HackathonDocBlock {

    private Long id;
    private Long sectionId;
    private String blockType;
    private String title;
    private String content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}
