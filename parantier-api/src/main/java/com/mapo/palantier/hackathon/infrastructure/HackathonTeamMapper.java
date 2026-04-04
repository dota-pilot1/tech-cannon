package com.mapo.palantier.hackathon.infrastructure;

import com.mapo.palantier.hackathon.domain.HackathonTeam;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HackathonTeamMapper {
    List<HackathonTeam> findByEventId(@Param("eventId") Long eventId);

    HackathonTeam findById(@Param("id") Long id);

    void insert(HackathonTeam team);

    void update(HackathonTeam team);

    void deleteById(@Param("id") Long id);
}
