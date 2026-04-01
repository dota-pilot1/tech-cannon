package com.mapo.palantier.meeting.websocket;

import com.mapo.palantier.meeting.application.MeetingChatService;
import com.mapo.palantier.meeting.domain.MeetingChatMessage;
import com.mapo.palantier.meeting.websocket.dto.MeetingChatParticipantPayload;
import com.mapo.palantier.meeting.websocket.dto.MeetingChatPayload;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * WebSocket Controller for Meeting Chat
 *
 * Client → Server (메시지): /app/meeting/chat
 * Client → Server (입장):   /app/meeting/chat/join
 * Client → Server (퇴장):   /app/meeting/chat/leave
 *
 * Server → Client (채널 메시지):  /topic/meeting-chat/{channelId}
 * Server → Client (참여자목록):   /topic/meeting-participants
 */
@Controller
public class MeetingChatWebSocketController {

    private final MeetingChatService meetingChatService;
    private final SimpMessagingTemplate messagingTemplate;

    // 현재 참여자 목록: userId → username
    private final ConcurrentHashMap<Long, String> participants =
        new ConcurrentHashMap<>();

    public MeetingChatWebSocketController(
        MeetingChatService meetingChatService,
        SimpMessagingTemplate messagingTemplate
    ) {
        this.meetingChatService = meetingChatService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 메시지 전송 (채널 포함)
     * Client → /app/meeting/chat
     */
    @MessageMapping("/meeting/chat")
    public void sendMessage(MeetingChatPayload payload) {
        try {
            // channelId 미지정 시 기본 채널(1) 사용
            Long channelId =
                payload.getChannelId() != null ? payload.getChannelId() : 1L;

            // 1. DB에 메시지 저장 (channelId 포함)
            MeetingChatMessage savedMessage = meetingChatService.createMessage(
                payload.getSenderId(),
                payload.getMessage(),
                channelId
            );

            // 2. 응답 객체 생성
            MeetingChatPayload response = new MeetingChatPayload();
            response.setId(savedMessage.getId());
            response.setUserId(savedMessage.getUserId());
            response.setSenderId(payload.getSenderId());
            response.setSenderName(payload.getSenderName());
            response.setMessage(savedMessage.getMessage());
            response.setChannelId(channelId);
            // createdAt이 null일 경우 현재 UTC 시간으로 폴백
            response.setCreatedAt(
                savedMessage.getCreatedAt() != null
                    ? savedMessage.getCreatedAt()
                    : LocalDateTime.now(ZoneOffset.UTC)
            );

            // 3. 채널별 브로드캐스트
            messagingTemplate.convertAndSend(
                "/topic/meeting-chat/" + channelId,
                response
            );
        } catch (Exception e) {
            System.err.println(
                "Error sending meeting chat message: " + e.getMessage()
            );
            e.printStackTrace();
        }
    }

    /**
     * 채팅 탭 입장
     * Client → /app/meeting/chat/join
     */
    @MessageMapping("/meeting/chat/join")
    public void join(MeetingChatParticipantPayload.Participant payload) {
        if (
            payload.getUserId() == null || payload.getUsername() == null
        ) return;

        participants.put(payload.getUserId(), payload.getUsername());
        broadcastParticipants();
    }

    /**
     * 채팅 탭 퇴장
     * Client → /app/meeting/chat/leave
     */
    @MessageMapping("/meeting/chat/leave")
    public void leave(MeetingChatParticipantPayload.Participant payload) {
        if (payload.getUserId() == null) return;

        participants.remove(payload.getUserId());
        broadcastParticipants();
    }

    /**
     * 현재 참여자 목록을 전체 브로드캐스트
     * Server → /topic/meeting-participants
     */
    private void broadcastParticipants() {
        List<MeetingChatParticipantPayload.Participant> list =
            new ArrayList<>();
        participants.forEach((userId, username) ->
            list.add(
                new MeetingChatParticipantPayload.Participant(userId, username)
            )
        );

        MeetingChatParticipantPayload payload =
            new MeetingChatParticipantPayload(list);
        messagingTemplate.convertAndSend(
            "/topic/meeting-participants",
            payload
        );
    }
}
