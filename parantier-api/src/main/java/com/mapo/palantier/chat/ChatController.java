package com.mapo.palantier.chat;

import com.mapo.palantier.websocket.PureWebSocketHandler;
import com.mapo.palantier.websocket.WsMessage;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final PureWebSocketHandler pureWebSocketHandler;
    private final ChatMessageMapper chatMessageMapper;

    /**
     * 채팅방별 메시지 전송
     * 클라이언트가 /app/chat/{roomId}/send 로 메시지 전송
     * → chat/{roomId} 토픽을 구독하는 클라이언트에게만 전송
     * → DB에 메시지 저장 (히스토리)
     */
    @MessageMapping("/chat/{roomId}/send")
    public void sendMessage(
        @DestinationVariable Long roomId,
        ChatMessage message
    ) {
        System.out.println(
            "Room " + roomId + " - Received message: " + message
        );

        message.setRoomId(roomId);
        message.setCreatedAt(LocalDateTime.now());

        // DB에 메시지 저장
        ChatMessageHistory history = new ChatMessageHistory();
        history.setRoomId(roomId);
        history.setSenderId(message.getSenderId());
        history.setSenderName(message.getSenderName());
        history.setContent(message.getContent());
        history.setMessageType(message.getMessageType());
        history.setCreatedAt(message.getCreatedAt());
        chatMessageMapper.insert(history);

        // PureWebSocketHandler로 브로드캐스트
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("roomId", roomId);
        data.put("senderId", message.getSenderId());
        data.put("senderName", message.getSenderName());
        data.put("content", message.getContent());
        data.put("messageType", message.getMessageType());
        data.put("createdAt", message.getCreatedAt().toString());

        pureWebSocketHandler.broadcast(
            "chat/" + roomId,
            new WsMessage("CHAT", "chat/" + roomId, data)
        );
    }
}
