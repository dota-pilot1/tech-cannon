package com.mapo.palantier.task.domain;

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
public class TaskPost {

    private Long id;
    private Long folderId;
    private String title;
    private Long authorId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // 상세 조회 시에만 포함
    private List<TaskBlock> blocks;

    // 도메인 팩토리 메서드 - 신규 생성
    public static TaskPost create(Long folderId, String title, Long authorId) {
        return TaskPost.builder()
            .folderId(folderId)
            .title(title)
            .authorId(authorId)
            .build();
    }

    // 도메인 팩토리 메서드 - 수정
    public static TaskPost modify(
        Long id,
        Long folderId,
        String title,
        Long authorId
    ) {
        return TaskPost.builder()
            .id(id)
            .folderId(folderId)
            .title(title)
            .authorId(authorId)
            .build();
    }
}
