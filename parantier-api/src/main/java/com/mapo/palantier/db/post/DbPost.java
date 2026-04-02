package com.mapo.palantier.db.post;

import com.mapo.palantier.db.block.DbBlock;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DbPost {
    private Long id;
    private Long folderId;
    private String title;
    private Long authorId;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private List<DbBlock> blocks;
}
