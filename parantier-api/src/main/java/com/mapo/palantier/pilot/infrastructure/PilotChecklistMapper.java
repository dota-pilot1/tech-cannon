package com.mapo.palantier.pilot.infrastructure;

import com.mapo.palantier.pilot.domain.PilotChecklist;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PilotChecklistMapper {
    List<PilotChecklist> findByPilotId(@Param("pilotId") Long pilotId);
    void insert(PilotChecklist checklist);
    void update(PilotChecklist checklist);
    void toggleChecked(@Param("id") Long id);
    void delete(@Param("id") Long id);
    void deleteByPilotId(@Param("pilotId") Long pilotId);
}
