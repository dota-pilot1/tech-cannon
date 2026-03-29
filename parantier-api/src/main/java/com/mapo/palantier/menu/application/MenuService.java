package com.mapo.palantier.menu.application;

import com.mapo.palantier.menu.domain.Menu;
import com.mapo.palantier.menu.domain.MenuRepository;
import com.mapo.palantier.menu.presentation.dto.MenuReorderRequest;
import java.util.*;
import java.util.List;
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
        // 각 메뉴에 allowedRoles 설정
        populateAllowedRoles(flatList);
        return buildMenuTree(flatList);
    }

    private List<Menu> buildMenuTree(List<Menu> flatList) {
        // 1단계: 모든 메뉴를 Map에 저장 (children 초기화)
        Map<Long, Menu> menuMap = new HashMap<>();
        for (Menu menu : flatList) {
            menu.setChildren(new ArrayList<>());
            menuMap.put(menu.getId(), menu);
        }

        // 2단계: 부모-자식 관계 설정
        List<Menu> rootMenus = new ArrayList<>();
        for (Menu menu : flatList) {
            if (menu.getParentId() == null) {
                rootMenus.add(menu);
            } else {
                Menu parent = menuMap.get(menu.getParentId());
                if (parent != null) {
                    parent.getChildren().add(menu);
                }
            }
        }

        // 3단계: 각 레벨에서 orderNum으로 정렬
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
        return menuRepository
            .findById(id)
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

    /**
     * 각 메뉴에 접근 가능한 역할 목록 설정
     */
    private void populateAllowedRoles(List<Menu> menus) {
        for (Menu menu : menus) {
            if (menu.getRequiredRole() != null) {
                // requiredRole이 있는 경우, 해당 역할과 상위 역할들을 조회
                List<String> allowedRoles = menuRepository.findAllowedRoles(
                    menu.getRequiredRole()
                );
                menu.setAllowedRoles(allowedRoles);
            } else {
                // requiredRole이 null이면 모든 역할이 접근 가능 (빈 리스트로 표시하거나 null)
                menu.setAllowedRoles(null);
            }
        }
    }
}
