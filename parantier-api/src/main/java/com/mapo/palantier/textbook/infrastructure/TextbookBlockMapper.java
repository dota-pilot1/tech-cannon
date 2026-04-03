package com.mapo.palantier.textbook.infrastructure;

import com.mapo.palantier.textbook.domain.TextbookBlock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TextbookBlockMapper {
    List<TextbookBlock> findBySectionId(@Param("sectionId") Long sectionId);
    void insert(TextbookBlock block);
    void deleteBySectionId(@Param("sectionId") Long sectionId);
}
