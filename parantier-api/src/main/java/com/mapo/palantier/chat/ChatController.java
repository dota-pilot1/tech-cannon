package com.mapo.palantier.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageMapper chatMessageMapper;

    /**
     * 채팅방별 메시지 전송
     * 클라이언트가 /app/chat/{roomId}/send 로 메시지 전송
     * → /topic/room/{roomId} 를 구독하는 클라이언트에게만 전송
     * → DB에 메시지 저장 (히스토리)
     */
    @MessageMapping("/chat/{roomId}/send")
    public void sendMessage(@DestinationVariable Long roomId, ChatMessage message) {
        // 메시지 수신 로그
        System.out.println("Room " + roomId + " - Received message: " + message);

        // roomId 설정 및 타임스탬프 추가
        message.setRoomId(roomId);
        message.setCreatedAt(LocalDateTime.now());

        // DB에 메시지 저장 (히스토리)
        ChatMessageHistory history = new ChatMessageHistory();
        history.setRoomId(roomId);
        history.setSenderId(message.getSenderId());
        history.setSenderName(message.getSenderName());
        history.setContent(message.getContent());
        history.setMessageType(message.getMessageType());
        history.setCreatedAt(message.getCreatedAt());

        chatMessageMapper.insert(history);

        // 해당 채팅방 구독자에게만 전송
        messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
    }
}
