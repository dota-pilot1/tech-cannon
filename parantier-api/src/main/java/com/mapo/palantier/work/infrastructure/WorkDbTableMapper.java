package com.mapo.palantier.work.infrastructure;

import com.mapo.palantier.work.domain.WorkDbTable;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WorkDbTableMapper {

    List<WorkDbTable> findByWorkId(@Param("workId") Long workId);

    void insert(WorkDbTable dbTable);

    void update(WorkDbTable dbTable);

    void delete(@Param("id") Long id);
}
