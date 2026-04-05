package com.mapo.palantier.core.infrastructure;

import com.mapo.palantier.core.domain.CoreSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CoreSectionMapper {
    List<CoreSection> findByCategoryId(Long categoryId);
    Optional<CoreSection> findById(Long id);
    void insert(CoreSection section);
    void update(CoreSection section);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
