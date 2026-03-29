package com.mapo.palantier.work.infrastructure;

import com.mapo.palantier.work.domain.WorkMindmap;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WorkMindmapMapper {

    List<WorkMindmap> findByWorkId(@Param("workId") Long workId);

    void insert(WorkMindmap mindmap);

    void update(WorkMindmap mindmap);

    void delete(@Param("id") Long id);
}
