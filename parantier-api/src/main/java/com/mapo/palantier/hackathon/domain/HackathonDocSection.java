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
public class HackathonDocSection {

    private Long id;
    private Long categoryId;
    private Long teamId;
    private String title;
    private Integer orderNum;
    private LocalDateTime createdAt;
}
