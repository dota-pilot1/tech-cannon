package com.mapo.palantier.hackathon.infrastructure;

import com.mapo.palantier.hackathon.domain.HackathonTeamMember;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HackathonTeamMemberMapper {

    List<HackathonTeamMember> findByTeamId(@Param("teamId") Long teamId);

    void insert(HackathonTeamMember member);

    void deleteByTeamIdAndUserId(
        @Param("teamId") Long teamId,
        @Param("userId") Long userId
    );
}
