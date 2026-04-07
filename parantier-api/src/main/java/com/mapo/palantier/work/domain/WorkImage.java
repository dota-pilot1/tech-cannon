package com.mapo.palantier.work.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkImage {
    private Long id;
    private Long workId;
    private String url;
    private String filename;
    private String fileType;
    private LocalDateTime createdAt;
}
