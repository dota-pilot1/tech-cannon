package com.mapo.palantier.frontend.infrastructure;

import com.mapo.palantier.frontend.domain.FrontendCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface FrontendCategoryMapper {
    List<FrontendCategory> findAll();
    Optional<FrontendCategory> findById(Long id);
    void insert(FrontendCategory category);
    void update(FrontendCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
