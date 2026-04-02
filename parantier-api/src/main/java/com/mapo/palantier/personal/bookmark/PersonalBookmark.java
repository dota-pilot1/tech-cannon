package com.mapo.palantier.personal.bookmark;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class PersonalBookmark {

    private Long id;
    private Long userId;
    private String title;
    private String url;
    private String description;
    private String category;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
