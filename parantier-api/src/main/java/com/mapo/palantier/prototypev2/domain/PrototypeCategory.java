package com.mapo.palantier.prototypev2.domain;
import lombok.*;
import java.time.LocalDateTime;
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class PrototypeCategory {
    private Long id;
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
