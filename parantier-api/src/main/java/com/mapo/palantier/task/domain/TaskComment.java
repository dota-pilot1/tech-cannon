package com.mapo.palantier.task.domain;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskComment {

    private Long id;
    private Long postId;
    private Long authorId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // 도메인 팩토리 메서드 - 신규 생성
    public static TaskComment create(
        Long postId,
        Long authorId,
        String content
    ) {
        return TaskComment.builder()
            .postId(postId)
            .authorId(authorId)
            .content(content)
            .build();
    }
}
