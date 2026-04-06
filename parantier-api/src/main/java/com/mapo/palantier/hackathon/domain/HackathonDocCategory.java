package com.mapo.palantier.hackathon.domain;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter @Setter @NoArgsConstructor
public class HackathonDocCategory {
    private Long id;
    private Long teamId;
    private String name;
    private Integer orderNum;
    private LocalDateTime createdAt;
}
