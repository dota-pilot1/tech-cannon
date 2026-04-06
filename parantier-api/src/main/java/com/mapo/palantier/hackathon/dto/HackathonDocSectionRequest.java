package com.mapo.palantier.hackathon.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class HackathonDocSectionRequest {

    private Long categoryId;
    private Long teamId;
    private String title;
    private Integer orderNum;
}
