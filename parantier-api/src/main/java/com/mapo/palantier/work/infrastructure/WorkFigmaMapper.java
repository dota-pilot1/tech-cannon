package com.mapo.palantier.work.infrastructure;

import com.mapo.palantier.work.domain.WorkFigma;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface WorkFigmaMapper {
    List<WorkFigma> findByWorkId(@Param("workId") Long workId);
    void insert(WorkFigma figma);
    void update(WorkFigma figma);
    void delete(@Param("id") Long id);
}
