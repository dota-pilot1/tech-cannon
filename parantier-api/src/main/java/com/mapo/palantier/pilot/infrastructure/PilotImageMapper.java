package com.mapo.palantier.pilot.infrastructure;

import com.mapo.palantier.pilot.domain.PilotImage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PilotImageMapper {
    List<PilotImage> findByPilotId(@Param("pilotId") Long pilotId);
    void insert(PilotImage image);
    void delete(@Param("id") Long id);
    void deleteByPilotId(@Param("pilotId") Long pilotId);
}
