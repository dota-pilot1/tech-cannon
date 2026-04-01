package com.mapo.palantier.prototype.dto;

import lombok.Data;

@Data
public class ProtoFolderDto {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
}
