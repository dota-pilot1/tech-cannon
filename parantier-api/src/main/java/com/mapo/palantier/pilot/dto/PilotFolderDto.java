package com.mapo.palantier.pilot.dto;

import lombok.Data;

@Data
public class PilotFolderDto {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
}
