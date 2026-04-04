package com.mapo.palantier.hackathon.infrastructure;

import com.mapo.palantier.hackathon.domain.HackathonChatMessage;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HackathonChatMapper {

    List<HackathonChatMessage> findRecentByEventId(
        @Param("eventId") Long eventId,
        @Param("limit") int limit
    );

    void insert(HackathonChatMessage message);
}
