package com.mapo.palantier.frontend.infrastructure;

import com.mapo.palantier.frontend.domain.FrontendSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface FrontendSectionMapper {
    List<FrontendSection> findByCategoryId(Long categoryId);
    Optional<FrontendSection> findById(Long id);
    void insert(FrontendSection section);
    void update(FrontendSection section);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
