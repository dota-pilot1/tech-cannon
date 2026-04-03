package com.mapo.palantier.architecture.infrastructure;

import com.mapo.palantier.architecture.domain.ArchitectureCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ArchitectureCategoryMapper {
    List<ArchitectureCategory> findAll();
    Optional<ArchitectureCategory> findById(Long id);
    void insert(ArchitectureCategory category);
    void update(ArchitectureCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
