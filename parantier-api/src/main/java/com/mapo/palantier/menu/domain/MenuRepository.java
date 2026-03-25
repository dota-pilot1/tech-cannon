package com.mapo.palantier.menu.domain;

import java.util.List;
import java.util.Optional;

public interface MenuRepository {
    // 조회
    List<Menu> findAllByRole(String role);
    List<Menu> findMenuTreeByRole(String role);
    List<Menu> findChildMenus(Long parentId, String role);
    Optional<Menu> findById(Long id);

    // CUD
    void save(Menu menu);
    void update(Menu menu);
    void deleteById(Long id);
}
