package com.mapo.palantier.architecture.infrastructure;

import com.mapo.palantier.architecture.domain.ArchitectureBlock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ArchitectureBlockMapper {
    List<ArchitectureBlock> findBySectionId(@Param("sectionId") Long sectionId);
    void insert(ArchitectureBlock block);
    void deleteBySectionId(@Param("sectionId") Long sectionId);
}
