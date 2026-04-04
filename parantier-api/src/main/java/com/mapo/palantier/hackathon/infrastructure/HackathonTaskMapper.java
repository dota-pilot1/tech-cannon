package com.mapo.palantier.hackathon.infrastructure;

import com.mapo.palantier.hackathon.domain.HackathonTeamTask;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HackathonTaskMapper {

    List<HackathonTeamTask> findByTeamId(@Param("teamId") Long teamId);

    void insert(HackathonTeamTask task);

    void update(HackathonTeamTask task);

    void deleteById(@Param("id") Long id);
}
