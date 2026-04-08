package com.mapo.palantier.devops.dto;
import lombok.Data;

@Data
public class DevOpsCategoryRequest {
    private String name;
    private String icon;
    private String emoji;
    private Integer orderNum;
}
