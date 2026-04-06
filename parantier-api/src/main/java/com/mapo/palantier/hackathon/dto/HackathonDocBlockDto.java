package com.mapo.palantier.hackathon.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class HackathonDocBlockDto {

    private Long id;
    private Long sectionId;
    private String blockType;
    private String title;
    private String content;
    private Integer sortOrder;
}
