package com.mapo.palantier.core.infrastructure;

import com.mapo.palantier.core.domain.CoreBlock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CoreBlockMapper {
    List<CoreBlock> findBySectionId(@Param("sectionId") Long sectionId);
    void insert(CoreBlock block);
    void deleteBySectionId(@Param("sectionId") Long sectionId);
}
