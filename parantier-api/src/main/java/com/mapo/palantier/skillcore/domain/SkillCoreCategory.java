package com.mapo.palantier.skillcore.domain;
import lombok.*;
import java.time.LocalDateTime;
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class SkillCoreCategory {
    private Long id;
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
