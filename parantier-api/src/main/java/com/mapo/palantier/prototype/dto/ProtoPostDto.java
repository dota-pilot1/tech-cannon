package com.mapo.palantier.prototype.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProtoPostDto {
    private Long id;
    private Long folderId;
    private String title;
    private Boolean isPinned;
    private List<String> tags;
    private List<ProtoBlockDto> blocks;
}
