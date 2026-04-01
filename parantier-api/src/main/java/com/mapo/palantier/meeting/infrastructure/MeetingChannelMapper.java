package com.mapo.palantier.meeting.infrastructure;

import com.mapo.palantier.meeting.domain.MeetingChannel;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MeetingChannelMapper {

    /**
     * 활성화된 채널 목록 조회 (order_num 기준 오름차순)
     */
    List<MeetingChannel> findAllActive();
}
