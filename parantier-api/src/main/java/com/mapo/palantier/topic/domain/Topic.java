package com.mapo.palantier.topic.domain;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Topic {

    private Long id;
    private String title;
    private String content;
    private String contentPlain;
    private Long authorId;
    private String authorName;
    private Integer viewCount;
    private Integer commentCount;
    private Boolean isPinned;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
