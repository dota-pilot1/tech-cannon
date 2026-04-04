package com.mapo.palantier.apidoc.infrastructure;

import com.mapo.palantier.apidoc.domain.ApiDocBlock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ApiDocBlockMapper {
    List<ApiDocBlock> findBySectionId(@Param("sectionId") Long sectionId);
    void insert(ApiDocBlock block);
    void deleteBySectionId(@Param("sectionId") Long sectionId);
}
