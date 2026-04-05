package com.mapo.palantier.core.infrastructure;

import com.mapo.palantier.core.domain.CoreCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CoreCategoryMapper {
    List<CoreCategory> findAll();
    Optional<CoreCategory> findById(Long id);
    void insert(CoreCategory category);
    void update(CoreCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
