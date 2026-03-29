package com.mapo.palantier.pilot.dto;

import lombok.Data;
import java.util.List;

@Data
public class PilotPostDto {
    private Long id;
    private Long folderId;
    private String title;
    private List<PilotBlockDto> blocks;
}
