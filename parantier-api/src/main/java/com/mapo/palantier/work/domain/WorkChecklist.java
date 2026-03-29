package com.mapo.palantier.work.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkChecklist {
    private Long id;
    private Long workId;
    private String content;
    private Boolean isChecked;
    private String imageUrl;
    private String imageFilename;
    private Integer orderNum;
    private LocalDateTime createdAt;
}
