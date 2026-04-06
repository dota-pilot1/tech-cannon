package com.mapo.palantier.subutai.ai.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubutaiDocSection {
    private Long id;
    private Long postId;
    private String title;
    private String content;
    private Integer orderNum;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
