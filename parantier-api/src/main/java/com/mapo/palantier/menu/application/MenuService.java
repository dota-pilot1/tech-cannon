package com.mapo.palantier.menu.application;

import com.mapo.palantier.menu.domain.Menu;
import com.mapo.palantier.menu.domain.MenuRepository;
import com.mapo.palantier.menu.presentation.dto.MenuReorderRequest;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {

    private final MenuRepository menuRepository;

    public List<Menu> getMenusByRole(String role) {
        return menuRepository.findAllByRole(role);
    }

    public List<Menu> getMenuTreeByRole(String role) {
        List<Menu> flatList = menuRepository.findMenuTreeByRole(role);
        flatList = populateAllowedRoles(flatList);
        return buildMenuTree(flatList);
    }

    private List<Menu> buildMenuTree(List<Menu> flatList) {
        // children 초기화: 각 메뉴를 children=new ArrayList() 로 재생성
        Map<Long, Menu> menuMap = new HashMap<>();
        for (Menu menu : flatList) {
            Menu withChildren = Menu.builder()
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
                .updatedAt(menu.getUpdatedAt())
                .allowedRoles(menu.getAllowedRoles())
                .children(new ArrayList<>())
                .build();
            menuMap.put(withChildren.getId(), withChildren);
        }

        List<Menu> rootMenus = new ArrayList<>();
        for (Menu menu : menuMap.values()) {
            if (menu.getParentId() == null) {
                rootMenus.add(menu);
            } else {
                Menu parent = menuMap.get(menu.getParentId());
                if (parent != null) {
                    parent.getChildren().add(menu);
                }
            }
        }

        sortMenusByOrderNum(rootMenus);
        return rootMenus;
    }

    private void sortMenusByOrderNum(List<Menu> menus) {
        menus.sort(Comparator.comparing(Menu::getOrderNum));
        for (Menu menu : menus) {
            if (menu.getChildren() != null && !menu.getChildren().isEmpty()) {
                sortMenusByOrderNum(menu.getChildren());
            }
        }
    }

    public List<Menu> getChildMenus(Long parentId, String role) {
        return menuRepository.findChildMenus(parentId, role);
    }

    public Menu getMenuById(Long id) {
        return menuRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Menu not found: " + id));
    }

    @Transactional
    public Menu createMenu(Menu menu) {
        menuRepository.save(menu);
        return menu;
    }

    @Transactional
    public Menu updateMenu(Menu menu) {
        menuRepository.update(menu);
        return menu;
    }

    @Transactional
    public void deleteMenu(Long id) {
        menuRepository.deleteById(id);
    }

    @Transactional
    public void reorderMenus(List<MenuReorderRequest> requests) {
        for (MenuReorderRequest req : requests) {
            menuRepository.updateOrderNum(req.getId(), req.getOrderNum());
        }
    }

    private List<Menu> populateAllowedRoles(List<Menu> menus) {
        List<Menu> result = new ArrayList<>();
        for (Menu menu : menus) {
            List<String> allowedRoles = null;
            if (menu.getRequiredRole() != null) {
                allowedRoles = menuRepository.findAllowedRoles(menu.getRequiredRole());
            }
            result.add(Menu.builder()
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
                .updatedAt(menu.getUpdatedAt())
                .allowedRoles(allowedRoles)
                .build());
        }
        return result;
    }
}
