package com.mapo.palantier.authority.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Authority {
    private Long id;
    private String name;         // 예: PROJECT:CREATE
    private String description;
    private Long categoryId;     // 카테고리 ID (FK)
    private Category category;   // 카테고리 객체 (JOIN 결과)
    private LocalDateTime createdAt;
}
