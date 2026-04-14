package com.mapo.palantier.prototypev2.domain;
import lombok.*;
import java.time.LocalDateTime;
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class PrototypeSection {
    private Long id;
    private Long categoryId;
    private String title;
    private Integer orderNum;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
