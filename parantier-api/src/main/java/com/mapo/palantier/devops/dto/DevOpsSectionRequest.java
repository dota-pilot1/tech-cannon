package com.mapo.palantier.devops.dto;
import lombok.Data;

@Data
public class DevOpsSectionRequest {
    private Long categoryId;
    private String title;
    private Integer orderNum;
}
