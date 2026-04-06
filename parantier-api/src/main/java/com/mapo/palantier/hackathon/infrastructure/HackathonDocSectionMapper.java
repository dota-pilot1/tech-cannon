package com.mapo.palantier.hackathon.infrastructure;

import com.mapo.palantier.hackathon.domain.HackathonDocSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface HackathonDocSectionMapper {
    List<HackathonDocSection> findByCategoryId(@Param("categoryId") Long categoryId);
    void insert(HackathonDocSection section);
    void update(@Param("id") Long id, @Param("title") String title);
    void delete(@Param("id") Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") Integer orderNum);
    int countByCategoryId(@Param("categoryId") Long categoryId);
}
