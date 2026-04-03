package com.mapo.palantier.faq.infrastructure;

import com.mapo.palantier.faq.domain.FaqBlock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FaqBlockMapper {
    List<FaqBlock> findBySectionId(@Param("sectionId") Long sectionId);
    void insert(FaqBlock block);
    void deleteBySectionId(@Param("sectionId") Long sectionId);
}
