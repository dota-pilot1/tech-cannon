package com.mapo.palantier.subutai.dto;

import lombok.Data;

@Data
public class SubutaiFolderDto {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
}
