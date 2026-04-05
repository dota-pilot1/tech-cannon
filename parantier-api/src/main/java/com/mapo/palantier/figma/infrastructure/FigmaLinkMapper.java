package com.mapo.palantier.figma.infrastructure;

import com.mapo.palantier.figma.domain.FigmaLink;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface FigmaLinkMapper {
    List<FigmaLink> findByCategoryId(@Param("categoryId") Long categoryId);
    Optional<FigmaLink> findById(@Param("id") Long id);
    void insert(FigmaLink link);
    void update(FigmaLink link);
    void delete(@Param("id") Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
