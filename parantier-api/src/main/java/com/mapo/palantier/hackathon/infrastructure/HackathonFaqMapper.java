package com.mapo.palantier.hackathon.infrastructure;

import com.mapo.palantier.hackathon.domain.HackathonTeamFaq;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HackathonFaqMapper {

    List<HackathonTeamFaq> findByTeamId(@Param("teamId") Long teamId);

    void insert(HackathonTeamFaq faq);

    void update(HackathonTeamFaq faq);

    void deleteById(@Param("id") Long id);
}
