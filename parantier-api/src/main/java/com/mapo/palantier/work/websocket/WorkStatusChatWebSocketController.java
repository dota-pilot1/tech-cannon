package com.mapo.palantier.work.websocket;

import com.mapo.palantier.work.application.WorkStatusChatService;
import com.mapo.palantier.work.domain.WorkStatusChatMessage;
import com.mapo.palantier.work.websocket.dto.WorkStatusChatParticipantPayload;
import com.mapo.palantier.work.websocket.dto.WorkStatusChatPayload;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * WebSocket Controller for Work Status Chat
 *
 * Client → Server (메시지): /app/work-status/chat
 * Client → Server (입장):   /app/work-status/chat/join
 * Client → Server (퇴장):   /app/work-status/chat/leave
 *
 * Server → Client (메시지):    /topic/work-status-chat
 * Server → Client (참여자목록): /topic/work-status-participants
 */
@Controller
public class WorkStatusChatWebSocketController {

    private final WorkStatusChatService workStatusChatService;
    private final SimpMessagingTemplate messagingTemplate;

    // 현재 참여자 목록: userId → username
    private final ConcurrentHashMap<Long, String> participants =
        new ConcurrentHashMap<>();

    public WorkStatusChatWebSocketController(
        WorkStatusChatService workStatusChatService,
        SimpMessagingTemplate messagingTemplate
    ) {
        this.workStatusChatService = workStatusChatService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 메시지 전송
     * Client → /app/work-status/chat
     */
    @MessageMapping("/work-status/chat")
    public void sendMessage(WorkStatusChatPayload payload) {
        try {
            // 1. DB에 메시지 저장
            WorkStatusChatMessage savedMessage =
                workStatusChatService.createMessage(
                    payload.getSenderId(),
                    payload.getMessage()
                );

            // 2. 응답 객체 생성
            WorkStatusChatPayload response = new WorkStatusChatPayload();
            response.setId(savedMessage.getId());
            response.setUserId(savedMessage.getUserId());
            response.setSenderId(payload.getSenderId());
            response.setSenderName(payload.getSenderName());
            response.setMessage(savedMessage.getMessage());
            // createdAt이 null일 경우 현재 UTC 시간으로 폴백
            response.setCreatedAt(
                savedMessage.getCreatedAt() != null
                    ? savedMessage.getCreatedAt()
                    : LocalDateTime.now(ZoneOffset.UTC)
            );

            // 3. 브로드캐스트
            messagingTemplate.convertAndSend(
                "/topic/work-status-chat",
                response
            );
        } catch (Exception e) {
            System.err.println(
                "Error sending work status chat message: " + e.getMessage()
            );
            e.printStackTrace();
        }
    }

    /**
     * 채팅 탭 입장
     * Client → /app/work-status/chat/join
     */
    @MessageMapping("/work-status/chat/join")
    public void join(WorkStatusChatParticipantPayload.Participant payload) {
        if (
            payload.getUserId() == null || payload.getUsername() == null
        ) return;

        participants.put(payload.getUserId(), payload.getUsername());
        broadcastParticipants();
    }

    /**
     * 채팅 탭 퇴장
     * Client → /app/work-status/chat/leave
     */
    @MessageMapping("/work-status/chat/leave")
    public void leave(WorkStatusChatParticipantPayload.Participant payload) {
        if (payload.getUserId() == null) return;

        participants.remove(payload.getUserId());
        broadcastParticipants();
    }

    /**
     * 현재 참여자 목록을 전체 브로드캐스트
     * Server → /topic/work-status-participants
     */
    private void broadcastParticipants() {
        List<WorkStatusChatParticipantPayload.Participant> list =
            new ArrayList<>();
        participants.forEach((userId, username) ->
            list.add(
                new WorkStatusChatParticipantPayload.Participant(
                    userId,
                    username
                )
            )
        );

        WorkStatusChatParticipantPayload payload =
            new WorkStatusChatParticipantPayload(list);
        messagingTemplate.convertAndSend(
            "/topic/work-status-participants",
            payload
        );
    }
}
