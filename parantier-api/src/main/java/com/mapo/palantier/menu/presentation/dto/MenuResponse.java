package com.mapo.palantier.menu.presentation.dto;

import com.mapo.palantier.menu.domain.Menu;
import com.mapo.palantier.menu.domain.MenuType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@Schema(description = "메뉴 응답")
public class MenuResponse {
    @Schema(description = "메뉴 ID")
    private Long id;

    @Schema(description = "메뉴 이름")
    private String name;

    @Schema(description = "메뉴 경로")
    private String path;

    @Schema(description = "부모 메뉴 ID")
    private Long parentId;

    @Schema(description = "메뉴 타입 (HEADER/SIDE/SUB)")
    private MenuType menuType;

    @Schema(description = "정렬 순서")
    private Integer orderNum;

    @Schema(description = "필요 권한 (USER/ADMIN)")
    private String requiredRole;

    @Schema(description = "아이콘")
    private String icon;

    @Schema(description = "활성화 여부")
    private Boolean isActive;

    @Schema(description = "생성일시")
    private LocalDateTime createdAt;

    @Schema(description = "자식 메뉴 목록")
    private List<MenuResponse> children;

    public static MenuResponse from(Menu menu) {
        return MenuResponse.builder()
                .id(menu.getId())
                .name(menu.getName())
                .path(menu.getPath())
                .parentId(menu.getParentId())
                .menuType(menu.getMenuType())
                .orderNum(menu.getOrderNum())
                .requiredRole(menu.getRequiredRole())
                .icon(menu.getIcon())
                .isActive(menu.getIsActive())
                .createdAt(menu.getCreatedAt())
                .children(menu.getChildren() != null && !menu.getChildren().isEmpty()
                        ? fromList(menu.getChildren())
                        : null)
                .build();
    }

    public static List<MenuResponse> fromList(List<Menu> menus) {
        return menus.stream()
                .map(MenuResponse::from)
                .toList();
    }
}
