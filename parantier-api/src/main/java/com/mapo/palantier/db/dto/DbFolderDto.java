package com.mapo.palantier.db.dto;

import lombok.Data;

@Data
public class DbFolderDto {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
}
