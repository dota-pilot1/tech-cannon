package com.mapo.palantier.work.websocket;

import com.mapo.palantier.work.application.WorkStatusChatService;
import com.mapo.palantier.work.domain.WorkStatusChatMessage;
import com.mapo.palantier.work.websocket.dto.WorkStatusChatPayload;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * WebSocket Controller for Work Status Chat
 *
 * Client → Server: /app/work-status/chat
 * Server → Client: /topic/work-status-chat
 */
@Controller
public class WorkStatusChatWebSocketController {

    private final WorkStatusChatService workStatusChatService;
    private final SimpMessagingTemplate messagingTemplate;

    public WorkStatusChatWebSocketController(
            WorkStatusChatService workStatusChatService,
            SimpMessagingTemplate messagingTemplate) {
        this.workStatusChatService = workStatusChatService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 클라이언트가 메시지를 전송하면 DB에 저장하고 채팅방을 구독한 모든 클라이언트에게 브로드캐스트
     *
     * @param payload 메시지 내용 (senderId, senderName, message 포함)
     */
    @MessageMapping("/work-status/chat")
    public void sendMessage(WorkStatusChatPayload payload) {
        try {
            System.out.println("=== WebSocket Work Status Chat Message Received ===");
            System.out.println("Payload: " + payload);
            System.out.println("SenderId: " + payload.getSenderId());
            System.out.println("SenderName: " + payload.getSenderName());
            System.out.println("Message: " + payload.getMessage());

            // 1. DB에 메시지 저장
            WorkStatusChatMessage savedMessage = workStatusChatService.createMessage(
                    payload.getSenderId(),
                    payload.getMessage()
            );

            // 2. 응답용 객체 생성 (작성자 정보 포함)
            WorkStatusChatPayload response = new WorkStatusChatPayload();
            response.setId(savedMessage.getId());
            response.setUserId(savedMessage.getUserId());
            response.setSenderId(payload.getSenderId());
            response.setSenderName(payload.getSenderName());
            response.setMessage(savedMessage.getMessage());
            response.setCreatedAt(savedMessage.getCreatedAt());

            // 3. 채팅방을 구독한 모든 클라이언트에게 브로드캐스트
            messagingTemplate.convertAndSend("/topic/work-status-chat", response);

        } catch (Exception e) {
            System.err.println("Error sending work status chat message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
