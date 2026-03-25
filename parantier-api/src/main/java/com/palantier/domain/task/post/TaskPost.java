package com.palantier.domain.task.post;

import com.palantier.domain.task.block.TaskBlock;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskPost {
    private Long id;
    private Long folderId;
    private String title;
    private Long authorId;
    private String authorName; // JOIN으로 가져옴
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // 상세 조회 시에만 포함
    private List<TaskBlock> blocks;
}
