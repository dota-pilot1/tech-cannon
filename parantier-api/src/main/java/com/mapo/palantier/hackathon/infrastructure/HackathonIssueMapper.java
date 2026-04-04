package com.mapo.palantier.hackathon.infrastructure;

import com.mapo.palantier.hackathon.domain.HackathonTeamIssue;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HackathonIssueMapper {

    List<HackathonTeamIssue> findByTeamId(@Param("teamId") Long teamId);

    void insert(HackathonTeamIssue issue);

    void update(HackathonTeamIssue issue);
}
