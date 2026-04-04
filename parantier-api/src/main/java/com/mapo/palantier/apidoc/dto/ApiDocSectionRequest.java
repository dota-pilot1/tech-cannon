package com.mapo.palantier.apidoc.dto;

import lombok.Data;

@Data
public class ApiDocSectionRequest {
    private Long categoryId;
    private String title;
    private Integer orderNum;
}
