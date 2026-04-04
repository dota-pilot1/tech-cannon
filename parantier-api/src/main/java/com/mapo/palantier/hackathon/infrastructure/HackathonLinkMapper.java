package com.mapo.palantier.hackathon.infrastructure;

import com.mapo.palantier.hackathon.domain.HackathonTeamLink;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HackathonLinkMapper {

    List<HackathonTeamLink> findByTeamId(@Param("teamId") Long teamId);

    void insert(HackathonTeamLink link);

    void deleteById(@Param("id") Long id);
}
