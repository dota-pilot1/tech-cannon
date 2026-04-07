package com.mapo.palantier.prototype.post;

import com.mapo.palantier.prototype.block.ProtoBlock;
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
public class ProtoPost {

    private Long id;
    private Long folderId;
    private String title;
    private Long authorId;
    private String authorName;
    private Boolean isPinned;
    private String tags; // 콤마 구분 문자열: "컨벤션,TypeScript,필독"
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private List<ProtoBlock> blocks;
}
