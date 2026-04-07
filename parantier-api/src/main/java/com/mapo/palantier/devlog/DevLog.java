package com.mapo.palantier.devlog;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevLog {

    private Long id;
    private Long userId;
    private String title;
    private String content;
    private Integer sortOrder;
    private LocalDate logDate;
    private String summary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private String authorEmail;
}
