package com.mapo.palantier.wiki.domain;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WikiFolder {

    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // 도메인 팩토리 메서드 - 신규 생성
    public static WikiFolder create(
        Long parentId,
        String name,
        Integer sortOrder,
        Long createdBy
    ) {
        return WikiFolder.builder()
            .parentId(parentId)
            .name(name)
            .sortOrder(sortOrder != null ? sortOrder : 0)
            .createdBy(createdBy)
            .build();
    }

    // 도메인 메서드 - 정보 수정용 새 인스턴스 반환
    public WikiFolder withUpdated(
        String name,
        Long parentId,
        Integer sortOrder
    ) {
        return WikiFolder.builder()
            .id(this.id)
            .parentId(parentId != null ? parentId : this.parentId)
            .name(name)
            .sortOrder(sortOrder != null ? sortOrder : this.sortOrder)
            .createdBy(this.createdBy)
            .createdAt(this.createdAt)
            .build();
    }
}
