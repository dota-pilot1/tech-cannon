package com.mapo.palantier.springai.domain;
import lombok.*;
import java.time.LocalDateTime;
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class SpringAiCategory {
    private Long id;
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
