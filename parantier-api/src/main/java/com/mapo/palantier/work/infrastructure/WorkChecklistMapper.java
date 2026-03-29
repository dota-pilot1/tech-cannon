package com.mapo.palantier.work.infrastructure;

import com.mapo.palantier.work.domain.WorkChecklist;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WorkChecklistMapper {

    List<WorkChecklist> findByWorkId(@Param("workId") Long workId);

    void insert(WorkChecklist checklist);

    void update(WorkChecklist checklist);

    void toggleChecked(@Param("id") Long id);

    void delete(@Param("id") Long id);
}
