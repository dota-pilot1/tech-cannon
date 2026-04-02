package com.mapo.palantier.db.dto;

import lombok.Data;
import java.util.List;

@Data
public class DbPostDto {
    private Long id;
    private Long folderId;
    private String title;
    private List<DbBlockDto> blocks;
}
