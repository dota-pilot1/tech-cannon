package com.mapo.palantier.work.infrastructure;

import com.mapo.palantier.work.domain.WorkStatusLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WorkStatusLogMapper {

    void insert(WorkStatusLog log);

    List<WorkStatusLog> findRecent(@Param("limit") int limit);

    List<WorkStatusLog> findByWorkId(@Param("workId") Long workId);
}
