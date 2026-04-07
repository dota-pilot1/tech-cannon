package com.mapo.palantier.pilot.post;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import com.mapo.palantier.pilot.block.PilotBlock;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PilotPost {
    private Long id;
    private Long folderId;
    private String title;
    private Long authorId;
    private String authorName; // JOIN으로 가져옴
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // 상세 조회 시에만 포함
    private List<PilotBlock> blocks;
}
