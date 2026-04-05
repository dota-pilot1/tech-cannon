package com.mapo.palantier.hackathon.infrastructure;

import com.mapo.palantier.hackathon.domain.HackathonTeamDoc;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HackathonDocMapper {

    List<HackathonTeamDoc> findByTeamId(@Param("teamId") Long teamId);

    HackathonTeamDoc findById(@Param("id") Long id);

    void insert(HackathonTeamDoc doc);

    void update(HackathonTeamDoc doc);

    void deleteById(@Param("id") Long id);
}
