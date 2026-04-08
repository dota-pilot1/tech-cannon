package com.mapo.palantier.springai.infrastructure;

import com.mapo.palantier.springai.domain.SpringAiBlock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SpringAiBlockMapper {
    List<SpringAiBlock> findBySectionId(@Param("sectionId") Long sectionId);
    void insert(SpringAiBlock block);
    void deleteBySectionId(@Param("sectionId") Long sectionId);
}
