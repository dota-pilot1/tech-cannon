package com.mapo.palantier.menu.domain;

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

    // 접근 가능한 모든 역할 목록 (조회 시에만 사용)
    @Builder.Default
    private List<String> allowedRoles = null;

    // 도메인 메서드: 메뉴 비활성화
    public Menu deactivate() {
        return Menu.builder()
            .id(this.id)
            .name(this.name)
            .path(this.path)
            .parentId(this.parentId)
            .menuType(this.menuType)
            .orderNum(this.orderNum)
            .requiredRole(this.requiredRole)
            .icon(this.icon)
            .isActive(false)
            .createdAt(this.createdAt)
            .updatedAt(LocalDateTime.now())
            .build();
    }

    // 도메인 메서드: 메뉴 활성화
    public Menu activate() {
        return Menu.builder()
            .id(this.id)
            .name(this.name)
            .path(this.path)
            .parentId(this.parentId)
            .menuType(this.menuType)
            .orderNum(this.orderNum)
            .requiredRole(this.requiredRole)
            .icon(this.icon)
            .isActive(true)
            .createdAt(this.createdAt)
            .updatedAt(LocalDateTime.now())
            .build();
    }

    // 도메인 메서드: 메뉴 정보 수정
    public Menu withUpdated(
        String name,
        String path,
        String icon,
        Integer orderNum,
        String requiredRole
    ) {
        return Menu.builder()
            .id(this.id)
            .name(name != null ? name : this.name)
            .path(path != null ? path : this.path)
            .parentId(this.parentId)
            .menuType(this.menuType)
            .orderNum(orderNum != null ? orderNum : this.orderNum)
            .requiredRole(
                requiredRole != null ? requiredRole : this.requiredRole
            )
            .icon(icon != null ? icon : this.icon)
            .isActive(this.isActive)
            .createdAt(this.createdAt)
            .updatedAt(LocalDateTime.now())
            .build();
    }

    // 도메인 판단: 최상위 메뉴 여부
    public boolean isRootMenu() {
        return this.parentId == null;
    }

    // 도메인 판단: 관리자 전용 메뉴 여부
    public boolean isAdminOnly() {
        return "ROLE_ADMIN".equals(this.requiredRole);
    }
}
