package com.mapo.palantier.wiki.domain;

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
public class WikiPost {

    private Long id;
    private Long folderId;
    private String title;
    private Long authorId;
    private Boolean isPinned;
    private Tags tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    private List<WikiBlock> blocks;

    // 도메인 팩토리 메서드 - 신규 생성
    public static WikiPost create(
        Long folderId,
        String title,
        Long authorId,
        Boolean isPinned,
        String tags
    ) {
        return WikiPost.builder()
            .folderId(folderId)
            .title(title)
            .authorId(authorId)
            .isPinned(isPinned != null ? isPinned : false)
            .tags(Tags.from(tags))
            .build();
    }

    // 도메인 팩토리 메서드 - 수정
    public static WikiPost modify(
        Long id,
        Long folderId,
        String title,
        Long authorId,
        Boolean isPinned,
        String tags
    ) {
        return WikiPost.builder()
            .id(id)
            .folderId(folderId)
            .title(title)
            .authorId(authorId)
            .isPinned(isPinned != null ? isPinned : false)
            .tags(Tags.from(tags))
            .build();
    }
}
