package com.mapo.palantier.hackathon.application;

import com.mapo.palantier.hackathon.domain.HackathonChatMessage;
import com.mapo.palantier.hackathon.infrastructure.HackathonChatMapper;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class HackathonChatService {

    private final HackathonChatMapper hackathonChatMapper;

    public HackathonChatService(HackathonChatMapper hackathonChatMapper) {
        this.hackathonChatMapper = hackathonChatMapper;
    }

    /**
     * 이벤트별 최근 메시지 목록 조회 (시간 오름차순)
     */
    public List<HackathonChatMessage> getRecentMessages(Long eventId, int limit) {
        return hackathonChatMapper.findRecentByEventId(eventId, limit);
    }

    /**
     * 메시지 생성
     */
    @Transactional
    public HackathonChatMessage createMessage(
        Long eventId,
        Long userId,
        String username,
        String content
    ) {
        HackathonChatMessage message = new HackathonChatMessage();
        message.setEventId(eventId);
        message.setUserId(userId);
        message.setUsername(username);
        message.setContent(content);

        hackathonChatMapper.insert(message);
        return message;
    }
}
