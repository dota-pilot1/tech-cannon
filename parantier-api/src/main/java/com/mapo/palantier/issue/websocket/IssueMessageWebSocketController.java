package com.mapo.palantier.issue.websocket;

import com.mapo.palantier.issue.application.IssueMessageService;
import com.mapo.palantier.issue.domain.IssueMessage;
import com.mapo.palantier.issue.websocket.dto.MessagePayload;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * WebSocket Controller for Issue Messages
 *
 * Client → Server: /app/issues/{issueId}/message
 * Server → Client: /topic/issues/{issueId}
 */
@Controller
public class IssueMessageWebSocketController {

    private final IssueMessageService issueMessageService;
    private final SimpMessagingTemplate messagingTemplate;

    public IssueMessageWebSocketController(
            IssueMessageService issueMessageService,
            SimpMessagingTemplate messagingTemplate) {
        this.issueMessageService = issueMessageService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 클라이언트가 메시지를 전송하면 DB에 저장하고 같은 이슈를 구독한 모든 클라이언트에게 브로드캐스트
     *
     * @param issueId 이슈 ID
     * @param payload 메시지 내용 (senderId, senderName, message 포함)
     */
    @MessageMapping("/issues/{issueId}/message")
    public void sendMessage(
            @DestinationVariable Long issueId,
            MessagePayload payload
    ) {
        try {
            System.out.println("=== WebSocket Message Received ===");
            System.out.println("Issue ID: " + issueId);
            System.out.println("Payload: " + payload);
            System.out.println("SenderId: " + payload.getSenderId());
            System.out.println("SenderName: " + payload.getSenderName());
            System.out.println("Message: " + payload.getMessage());

            // 1. DB에 메시지 저장
            IssueMessage savedMessage = issueMessageService.createMessage(
                    issueId,
                    payload.getSenderId(),
                    payload.getMessage()
            );

            // 2. 응답용 객체 생성 (작성자 정보 포함)
            MessagePayload response = new MessagePayload();
            response.setId(savedMessage.getId());
            response.setIssueId(savedMessage.getIssueId());
            response.setUserId(savedMessage.getUserId());
            response.setSenderId(payload.getSenderId());
            response.setSenderName(payload.getSenderName());
            response.setMessage(savedMessage.getMessage());
            response.setCreatedAt(savedMessage.getCreatedAt());
            response.setUpdatedAt(savedMessage.getUpdatedAt());

            // 3. 해당 이슈를 구독한 모든 클라이언트에게 브로드캐스트
            messagingTemplate.convertAndSend("/topic/issues/" + issueId, response);

        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
