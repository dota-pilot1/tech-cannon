package com.mapo.palantier.menu.presentation.dto;

import com.mapo.palantier.menu.domain.Menu;
import com.mapo.palantier.menu.domain.MenuType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "메뉴 생성 요청")
public class CreateMenuRequest {
    @Schema(description = "메뉴 이름", example = "프로젝트 관리")
    private String name;

    @Schema(description = "메뉴 경로", example = "/admin/projects")
    private String path;

    @Schema(description = "부모 메뉴 ID", example = "2")
    private Long parentId;

    @Schema(description = "메뉴 타입", example = "SIDE")
    private MenuType menuType;

    @Schema(description = "정렬 순서", example = "3")
    private Integer orderNum;

    @Schema(description = "필요 권한", example = "ADMIN")
    private String requiredRole;

    @Schema(description = "아이콘", example = "FolderOpen")
    private String icon;

    public Menu toEntity() {
        return Menu.builder()
                .name(name)
                .path(path)
                .parentId(parentId)
                .menuType(menuType)
                .orderNum(orderNum != null ? orderNum : 0)
                .requiredRole(requiredRole)
                .icon(icon)
                .isActive(true)
                .build();
    }
}
