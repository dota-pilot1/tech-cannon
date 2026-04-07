package com.mapo.palantier.subutai.ai.domain;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubutaiDocPost {

    private Long id;
    private Long folderId;
    private String title;
    private Integer orderNum;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<SubutaiDocSection> sections;
}
