package com.mapo.palantier.work.application;

import com.mapo.palantier.work.domain.WorkStatusChatMessage;
import com.mapo.palantier.work.domain.WorkStatusChatMessageWithUser;
import com.mapo.palantier.work.infrastructure.WorkStatusChatMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class WorkStatusChatService {

    private final WorkStatusChatMapper workStatusChatMapper;

    public WorkStatusChatService(WorkStatusChatMapper workStatusChatMapper) {
        this.workStatusChatMapper = workStatusChatMapper;
    }

    /**
     * 최근 메시지 목록 조회 (작성자 정보 포함, 시간 오름차순)
     */
    public List<WorkStatusChatMessageWithUser> getRecentMessages(int limit) {
        return workStatusChatMapper.findRecent(limit);
    }

    /**
     * 메시지 생성
     */
    @Transactional
    public WorkStatusChatMessage createMessage(Long userId, String message) {
        WorkStatusChatMessage chatMessage = new WorkStatusChatMessage();
        chatMessage.setUserId(userId);
        chatMessage.setMessage(message);
        chatMessage.setIsDeleted(false);

        workStatusChatMapper.insert(chatMessage);
        return chatMessage;
    }
}
