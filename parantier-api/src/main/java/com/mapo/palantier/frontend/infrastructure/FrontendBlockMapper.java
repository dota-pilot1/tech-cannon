package com.mapo.palantier.frontend.infrastructure;

import com.mapo.palantier.frontend.domain.FrontendBlock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FrontendBlockMapper {
    List<FrontendBlock> findBySectionId(@Param("sectionId") Long sectionId);
    void insert(FrontendBlock block);
    void deleteBySectionId(@Param("sectionId") Long sectionId);
}
