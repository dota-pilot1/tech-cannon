package com.mapo.palantier.organization.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Organization {
    private Long id;
    private String name;
    private String code;
    private String description;
    private Long parentId;
    private String orgType;  // COMPANY, DEPARTMENT, TEAM
    private Integer level;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;

    // 트리 구조를 위한 필드
    private List<Organization> children;
}
