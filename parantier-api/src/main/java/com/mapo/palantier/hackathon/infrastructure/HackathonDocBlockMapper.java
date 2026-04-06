package com.mapo.palantier.hackathon.infrastructure;

import com.mapo.palantier.hackathon.domain.HackathonDocBlock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface HackathonDocBlockMapper {
    List<HackathonDocBlock> findBySectionId(@Param("sectionId") Long sectionId);
    void deleteAllBySectionId(@Param("sectionId") Long sectionId);
    void insertBatch(@Param("blocks") List<HackathonDocBlock> blocks);
}
