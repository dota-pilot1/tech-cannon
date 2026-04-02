package com.mapo.palantier.memo;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class Memo {

    private Long id;
    private Long userId;
    private String title;
    private String content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
