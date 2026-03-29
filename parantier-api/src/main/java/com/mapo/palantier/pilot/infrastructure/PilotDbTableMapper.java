package com.mapo.palantier.pilot.infrastructure;

import com.mapo.palantier.pilot.domain.PilotDbTable;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PilotDbTableMapper {
    List<PilotDbTable> findByPilotId(@Param("pilotId") Long pilotId);
    void insert(PilotDbTable dbTable);
    void update(PilotDbTable dbTable);
    void delete(@Param("id") Long id);
    void deleteByPilotId(@Param("pilotId") Long pilotId);
}
