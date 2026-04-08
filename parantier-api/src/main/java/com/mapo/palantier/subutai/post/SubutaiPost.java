package com.mapo.palantier.subutai.post;

import com.mapo.palantier.subutai.block.SubutaiBlock;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubutaiPost {

    private Long id;
    private Long folderId;
    private String title;
    private Long authorId;
    private String authorName; // JOIN으로 가져옴
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // 상세 조회 시에만 포함
    private List<SubutaiBlock> blocks;
}
