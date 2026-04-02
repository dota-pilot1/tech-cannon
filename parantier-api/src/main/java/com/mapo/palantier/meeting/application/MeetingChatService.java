package com.mapo.palantier.meeting.application;

import com.mapo.palantier.meeting.domain.MeetingChannel;
import com.mapo.palantier.meeting.domain.MeetingChatMessage;
import com.mapo.palantier.meeting.domain.MeetingChatMessageWithUser;
import com.mapo.palantier.meeting.infrastructure.MeetingChannelMapper;
import com.mapo.palantier.meeting.infrastructure.MeetingChatMapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class MeetingChatService {

    private final MeetingChatMapper meetingChatMapper;
    private final MeetingChannelMapper meetingChannelMapper;

    public MeetingChatService(
        MeetingChatMapper meetingChatMapper,
        MeetingChannelMapper meetingChannelMapper
    ) {
        this.meetingChatMapper = meetingChatMapper;
        this.meetingChannelMapper = meetingChannelMapper;
    }

    /**
     * 채널별 최근 메시지 목록 조회 (작성자 정보 포함, 시간 오름차순)
     */
    public List<MeetingChatMessageWithUser> getRecentMessages(
        long channelId,
        int limit
    ) {
        return meetingChatMapper.findRecent(channelId, limit);
    }

    /**
     * 메시지 생성 (채널 포함)
     */
    @Transactional
    public MeetingChatMessage createMessage(
        Long userId,
        String message,
        Long channelId
    ) {
        MeetingChatMessage chatMessage = new MeetingChatMessage();
        chatMessage.setUserId(userId);
        chatMessage.setChannelId(channelId != null ? channelId : 1L);
        chatMessage.setMessage(message);
        chatMessage.setIsDeleted(false);

        meetingChatMapper.insert(chatMessage);
        return chatMessage;
    }

    /**
     * 활성 채널 목록 조회
     */
    public List<MeetingChannel> getChannels() {
        return meetingChannelMapper.findAllActive();
    }

    /**
     * 채널별 최근 N분간 메시지 수 집계
     */
    public Map<Long, Integer> getRecentActivityCounts(int minutes) {
        List<Map<String, Object>> raw = meetingChatMapper.countRecentByChannels(
            minutes
        );
        Map<Long, Integer> result = new HashMap<>();
        for (Map<String, Object> row : raw) {
            Long channelId = ((Number) row.get("channelid")).longValue();
            Integer count = ((Number) row.get("messagecount")).intValue();
            result.put(channelId, count);
        }
        return result;
    }
}
