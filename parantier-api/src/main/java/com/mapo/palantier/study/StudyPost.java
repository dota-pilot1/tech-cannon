package com.mapo.palantier.study;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyPost {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String title;
    private String content;
    private Long authorId;
    private String authorName;
    private Boolean isPublic;
    private Integer viewCount;
    private Boolean isPinned;
    private Long likeCount;
    private Long commentCount;
    private Boolean isLikedByMe;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
