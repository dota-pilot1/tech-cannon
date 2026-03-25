package com.mapo.palantier.organization.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrganizationRequest {
    private String name;
    private String code;
    private String description;
    private Long parentId;
    private String orgType;  // COMPANY, DEPARTMENT, TEAM
    private Integer level;
    private Integer displayOrder;
}
