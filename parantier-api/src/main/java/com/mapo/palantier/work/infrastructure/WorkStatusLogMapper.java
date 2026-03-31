package com.mapo.palantier.work.infrastructure;

import com.mapo.palantier.work.domain.WorkStatusLog;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface WorkStatusLogMapper {
    void insert(WorkStatusLog log);

    List<WorkStatusLog> findRecent(@Param("limit") int limit);

    List<WorkStatusLog> findByWorkId(@Param("workId") Long workId);

    void deleteByWorkIdAndNewValue(
        @Param("workId") Long workId,
        @Param("newValue") String newValue
    );
}
