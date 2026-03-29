package com.mapo.palantier.work.infrastructure;

import com.mapo.palantier.work.domain.WorkImage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WorkImageMapper {

    List<WorkImage> findByWorkId(@Param("workId") Long workId);

    void insert(WorkImage image);

    void delete(@Param("id") Long id);
}
