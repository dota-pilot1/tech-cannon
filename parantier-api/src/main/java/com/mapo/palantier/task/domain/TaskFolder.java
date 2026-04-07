package com.mapo.palantier.task.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskFolder {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // 도메인 팩토리 메서드 - 신규 생성
    public static TaskFolder create(Long parentId, String name, Integer sortOrder, Long createdBy) {
        return TaskFolder.builder()
                .parentId(parentId)
                .name(name)
                .sortOrder(sortOrder != null ? sortOrder : 0)
                .createdBy(createdBy)
                .build();
    }

    // 도메인 메서드 - 정보 수정용 새 인스턴스 반환
    public TaskFolder withUpdated(String name, Long parentId, Integer sortOrder) {
        return TaskFolder.builder()
                .id(this.id)
                .parentId(parentId != null ? parentId : this.parentId)
                .name(name)
                .sortOrder(sortOrder != null ? sortOrder : this.sortOrder)
                .createdBy(this.createdBy)
                .createdAt(this.createdAt)
                .build();
    }
}
