package com.mapo.palantier.subutai.dto;

import lombok.Data;
import java.util.List;

@Data
public class SubutaiPostDto {
    private Long id;
    private Long folderId;
    private String title;
    private List<SubutaiBlockDto> blocks;
}
