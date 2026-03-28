package com.mapo.palantier.study;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StudyCategoryMapper {
    List<StudyCategory> findAllFlat();
    void insert(StudyCategory category);
    void update(StudyCategory category);
    void delete(@Param("id") Long id);
}
