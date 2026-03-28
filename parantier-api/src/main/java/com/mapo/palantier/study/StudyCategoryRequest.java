package com.mapo.palantier.study;

import lombok.Data;

@Data
public class StudyCategoryRequest {
    private String name;
    private Long parentId;
    private String icon;
    private String description;
    private Integer orderNum;
}
