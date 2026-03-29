package com.mapo.palantier.pilot.infrastructure;

import com.mapo.palantier.pilot.domain.PilotFigma;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PilotFigmaMapper {
    List<PilotFigma> findByPilotId(@Param("pilotId") Long pilotId);
    void insert(PilotFigma figma);
    void update(PilotFigma figma);
    void delete(@Param("id") Long id);
}
