package com.mapo.palantier.hackathon.infrastructure;

import com.mapo.palantier.hackathon.domain.HackathonDocCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface HackathonDocCategoryMapper {
    List<HackathonDocCategory> findByTeamId(@Param("teamId") Long teamId);
    void insert(HackathonDocCategory category);
    void update(@Param("id") Long id, @Param("name") String name);
    void delete(@Param("id") Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") Integer orderNum);
    int countByTeamId(@Param("teamId") Long teamId);
}
