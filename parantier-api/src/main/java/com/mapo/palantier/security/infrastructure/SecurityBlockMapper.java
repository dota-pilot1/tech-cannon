package com.mapo.palantier.security.infrastructure;

import com.mapo.palantier.security.domain.SecurityBlock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SecurityBlockMapper {
    List<SecurityBlock> findBySectionId(@Param("sectionId") Long sectionId);
    void insert(SecurityBlock block);
    void deleteBySectionId(@Param("sectionId") Long sectionId);
}
