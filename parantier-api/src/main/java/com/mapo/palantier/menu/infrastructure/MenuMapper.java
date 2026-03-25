package com.mapo.palantier.menu.infrastructure;

import com.mapo.palantier.menu.domain.Menu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface MenuMapper {
    List<Menu> findAllByRole(@Param("role") String role);
    List<Menu> findMenuTreeByRole(@Param("role") String role);
    List<Menu> findChildMenus(@Param("parentId") Long parentId, @Param("role") String role);
    Optional<Menu> findById(@Param("id") Long id);

    // 특정 역할에 접근 가능한 모든 역할 목록 조회
    List<String> findAllowedRoles(@Param("requiredRole") String requiredRole);

    void insert(Menu menu);
    void update(Menu menu);
    void deleteById(@Param("id") Long id);
}
