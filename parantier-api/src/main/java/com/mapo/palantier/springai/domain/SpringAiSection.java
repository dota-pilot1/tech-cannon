package com.mapo.palantier.springai.domain;
import lombok.*;
import java.time.LocalDateTime;
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class SpringAiSection {
    private Long id;
    private Long categoryId;
    private String title;
    private Integer orderNum;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
