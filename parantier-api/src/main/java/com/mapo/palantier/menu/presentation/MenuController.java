package com.mapo.palantier.menu.presentation;

import com.mapo.palantier.menu.application.MenuService;
import com.mapo.palantier.menu.domain.Menu;
import com.mapo.palantier.menu.presentation.dto.CreateMenuRequest;
import com.mapo.palantier.menu.presentation.dto.MenuResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "메뉴 관리", description = "메뉴 관리 API")
@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {
    private final MenuService menuService;

    @Operation(summary = "메뉴 트리 조회", description = "현재 사용자 권한에 맞는 메뉴 트리 조회")
    @GetMapping("/tree")
    public ResponseEntity<List<MenuResponse>> getMenuTree(Authentication auth) {
        String role = "USER"; // 기본값

        if (auth != null && auth.getAuthorities() != null) {
            role = auth.getAuthorities().stream()
                    .findFirst()
                    .map(Object::toString)
                    .map(r -> r.replace("ROLE_", ""))  // ROLE_ 접두사 제거
                    .orElse("USER");
        }

        List<Menu> menus = menuService.getMenuTreeByRole(role);
        return ResponseEntity.ok(MenuResponse.fromList(menus));
    }

    @Operation(summary = "자식 메뉴 조회", description = "특정 부모 메뉴의 자식 메뉴들 조회")
    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<MenuResponse>> getChildMenus(
            @PathVariable Long parentId,
            Authentication auth
    ) {
        String role = auth.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .map(r -> r.replace("ROLE_", ""))
                .orElse("USER");

        List<Menu> menus = menuService.getChildMenus(parentId, role);
        return ResponseEntity.ok(MenuResponse.fromList(menus));
    }

    @Operation(summary = "메뉴 생성 (관리자)", description = "새로운 메뉴 생성 (관리자만 가능)")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuResponse> createMenu(@RequestBody CreateMenuRequest request) {
        Menu menu = menuService.createMenu(request.toEntity());
        return ResponseEntity.ok(MenuResponse.from(menu));
    }

    @Operation(summary = "메뉴 수정 (관리자)", description = "기존 메뉴 수정 (관리자만 가능)")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuResponse> updateMenu(
            @PathVariable Long id,
            @RequestBody CreateMenuRequest request
    ) {
        Menu menu = request.toEntity();
        Menu updated = menuService.updateMenu(Menu.builder()
                .id(id)
                .name(menu.getName())
                .path(menu.getPath())
                .parentId(menu.getParentId())
                .menuType(menu.getMenuType())
                .orderNum(menu.getOrderNum())
                .requiredRole(menu.getRequiredRole())
                .icon(menu.getIcon())
                .isActive(menu.getIsActive())
                .build());
        return ResponseEntity.ok(MenuResponse.from(updated));
    }

    @Operation(summary = "메뉴 삭제 (관리자)", description = "메뉴 삭제 (관리자만 가능)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return ResponseEntity.noContent().build();
    }
}
