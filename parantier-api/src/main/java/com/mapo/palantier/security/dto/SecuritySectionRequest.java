package com.mapo.palantier.security.dto;

import lombok.Data;

@Data
public class SecuritySectionRequest {
    private Long categoryId;
    private String title;
    private Integer orderNum;
}
