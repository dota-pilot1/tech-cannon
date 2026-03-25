package com.mapo.palantier.menu.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Menu {
    private Long id;
    private String name;
    private String path;
    private Long parentId;
    private MenuType menuType;
    private Integer orderNum;
    private String requiredRole;
    private String icon;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 트리 구조용 (조회 시에만 사용)
    @Builder.Default
    private List<Menu> children = null;
}
