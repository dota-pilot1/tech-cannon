package com.mapo.palantier.work.websocket;

import com.mapo.palantier.work.application.WorkMessageService;
import com.mapo.palantier.work.domain.WorkMessage;
import com.mapo.palantier.work.websocket.dto.WorkMessagePayload;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * WebSocket Controller for Work Messages
 *
 * Client → Server: /app/works/{workId}/message
 * Server → Client: /topic/works/{workId}
 */
@Controller
public class WorkMessageWebSocketController {

    private final WorkMessageService workMessageService;
    private final SimpMessagingTemplate messagingTemplate;

    public WorkMessageWebSocketController(
            WorkMessageService workMessageService,
            SimpMessagingTemplate messagingTemplate) {
        this.workMessageService = workMessageService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 클라이언트가 메시지를 전송하면 DB에 저장하고 같은 업무를 구독한 모든 클라이언트에게 브로드캐스트
     *
     * @param workId  업무 ID
     * @param payload 메시지 내용 (senderId, senderName, message 포함)
     */
    @MessageMapping("/works/{workId}/message")
    public void sendMessage(
            @DestinationVariable Long workId,
            WorkMessagePayload payload
    ) {
        try {
            System.out.println("=== WebSocket Work Message Received ===");
            System.out.println("Work ID: " + workId);
            System.out.println("Payload: " + payload);
            System.out.println("SenderId: " + payload.getSenderId());
            System.out.println("SenderName: " + payload.getSenderName());
            System.out.println("Message: " + payload.getMessage());

            // 1. DB에 메시지 저장
            WorkMessage savedMessage = workMessageService.createMessage(
                    workId,
                    payload.getSenderId(),
                    payload.getMessage()
            );

            // 2. 응답용 객체 생성 (작성자 정보 포함)
            WorkMessagePayload response = new WorkMessagePayload();
            response.setId(savedMessage.getId());
            response.setWorkId(savedMessage.getWorkId());
            response.setUserId(savedMessage.getUserId());
            response.setSenderId(payload.getSenderId());
            response.setSenderName(payload.getSenderName());
            response.setMessage(savedMessage.getMessage());
            response.setCreatedAt(savedMessage.getCreatedAt());
            response.setUpdatedAt(savedMessage.getUpdatedAt());

            // 3. 해당 업무를 구독한 모든 클라이언트에게 브로드캐스트
            messagingTemplate.convertAndSend("/topic/works/" + workId, response);

        } catch (Exception e) {
            System.err.println("Error sending work message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
