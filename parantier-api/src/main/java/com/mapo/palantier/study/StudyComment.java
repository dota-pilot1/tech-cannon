package com.mapo.palantier.study;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class StudyComment {

    private Long id;
    private Long postId;
    private Long authorId;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
