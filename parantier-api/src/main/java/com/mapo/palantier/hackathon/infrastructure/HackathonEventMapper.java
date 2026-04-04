package com.mapo.palantier.hackathon.infrastructure;

import com.mapo.palantier.hackathon.domain.HackathonEvent;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface HackathonEventMapper {

    HackathonEvent findActive();

    List<HackathonEvent> findAll();

    void insert(HackathonEvent event);

    void update(HackathonEvent event);
}
