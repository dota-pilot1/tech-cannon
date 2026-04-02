package com.mapo.palantier.meeting.infrastructure;

import com.mapo.palantier.meeting.domain.MeetingChatMessage;
import com.mapo.palantier.meeting.domain.MeetingChatMessageWithUser;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MeetingChatMapper {
    /**
     * 채널별 최근 메시지 목록 조회 (작성자 정보 포함, 시간순 정렬)
     */
    List<MeetingChatMessageWithUser> findRecent(
        @Param("channelId") long channelId,
        @Param("limit") int limit
    );

    /**
     * 메시지 생성
     */
    void insert(MeetingChatMessage message);

    /**
     * 채널별 최근 N분간 메시지 수 집계
     */
    List<Map<String, Object>> countRecentByChannels(
        @Param("minutes") int minutes
    );
}
