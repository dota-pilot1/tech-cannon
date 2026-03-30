package com.mapo.palantier.work.infrastructure;

import com.mapo.palantier.work.domain.SubWork;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SubWorkMapper {
    List<SubWork> findByParentWorkId(@Param("parentWorkId") Long parentWorkId);
    SubWork findById(@Param("id") Long id);
    void insert(SubWork subWork);
    void update(SubWork subWork);
    void delete(@Param("id") Long id);
    void toggleResolved(@Param("id") Long id);
}
