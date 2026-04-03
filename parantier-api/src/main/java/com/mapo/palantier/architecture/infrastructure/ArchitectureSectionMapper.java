package com.mapo.palantier.architecture.infrastructure;

import com.mapo.palantier.architecture.domain.ArchitectureSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ArchitectureSectionMapper {
    List<ArchitectureSection> findByCategoryId(Long categoryId);
    Optional<ArchitectureSection> findById(Long id);
    void insert(ArchitectureSection section);
    void update(ArchitectureSection section);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
