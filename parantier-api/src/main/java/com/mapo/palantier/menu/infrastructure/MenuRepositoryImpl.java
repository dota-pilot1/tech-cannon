package com.mapo.palantier.menu.infrastructure;

import com.mapo.palantier.menu.domain.Menu;
import com.mapo.palantier.menu.domain.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MenuRepositoryImpl implements MenuRepository {
    private final MenuMapper menuMapper;

    @Override
    public List<Menu> findAllByRole(String role) {
        return menuMapper.findAllByRole(role);
    }

    @Override
    public List<Menu> findMenuTreeByRole(String role) {
        return menuMapper.findMenuTreeByRole(role);
    }

    @Override
    public List<Menu> findChildMenus(Long parentId, String role) {
        return menuMapper.findChildMenus(parentId, role);
    }

    @Override
    public Optional<Menu> findById(Long id) {
        return menuMapper.findById(id);
    }

    @Override
    public void save(Menu menu) {
        menuMapper.insert(menu);
    }

    @Override
    public void update(Menu menu) {
        menuMapper.update(menu);
    }

    @Override
    public void deleteById(Long id) {
        menuMapper.deleteById(id);
    }
}
