package com.mapo.palantier.subutai.ai.domain;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubutaiDocSection {

    private Long id;
    private Long postId;
    private String title;
    private String content;
    private Integer orderNum;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
