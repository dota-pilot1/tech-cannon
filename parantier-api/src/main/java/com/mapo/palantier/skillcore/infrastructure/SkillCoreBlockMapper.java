package com.mapo.palantier.skillcore.infrastructure;

import com.mapo.palantier.skillcore.domain.SkillCoreBlock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SkillCoreBlockMapper {
    List<SkillCoreBlock> findBySectionId(@Param("sectionId") Long sectionId);
    void insert(SkillCoreBlock block);
    void deleteBySectionId(@Param("sectionId") Long sectionId);
}
