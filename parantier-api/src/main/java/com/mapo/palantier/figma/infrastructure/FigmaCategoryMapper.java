package com.mapo.palantier.figma.infrastructure;

import com.mapo.palantier.figma.domain.FigmaCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface FigmaCategoryMapper {
    List<FigmaCategory> findAll();
    Optional<FigmaCategory> findById(Long id);
    void insert(FigmaCategory category);
    void update(FigmaCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
