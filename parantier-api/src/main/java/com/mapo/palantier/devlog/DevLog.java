package com.mapo.palantier.devlog;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class DevLog {

    private Long id;
    private Long userId;
    private String title;
    private String content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
