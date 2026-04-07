package com.mapo.palantier.hackathon.domain;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HackathonDocCategory {

    private Long id;
    private Long teamId;
    private String name;
    private Integer orderNum;
    private LocalDateTime createdAt;
}
