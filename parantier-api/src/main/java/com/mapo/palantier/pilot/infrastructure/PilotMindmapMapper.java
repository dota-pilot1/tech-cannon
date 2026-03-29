package com.mapo.palantier.pilot.infrastructure;

import com.mapo.palantier.pilot.domain.PilotMindmap;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PilotMindmapMapper {
    List<PilotMindmap> findByPilotId(@Param("pilotId") Long pilotId);
    void insert(PilotMindmap mindmap);
    void update(PilotMindmap mindmap);
    void delete(@Param("id") Long id);
    void deleteByPilotId(@Param("pilotId") Long pilotId);
}
