package com.mapo.palantier.hackathon.domain;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter @Setter @NoArgsConstructor
public class HackathonDocSection {
    private Long id;
    private Long categoryId;
    private Long teamId;
    private String title;
    private Integer orderNum;
    private LocalDateTime createdAt;
}
