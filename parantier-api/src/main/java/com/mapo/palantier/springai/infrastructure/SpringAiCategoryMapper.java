package com.mapo.palantier.springai.infrastructure;

import com.mapo.palantier.springai.domain.SpringAiCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface SpringAiCategoryMapper {
    List<SpringAiCategory> findAll();
    Optional<SpringAiCategory> findById(Long id);
    void insert(SpringAiCategory category);
    void update(SpringAiCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
