package com.mapo.palantier.chat.presentation;

import com.mapo.palantier.chat.application.ChatMessageService;
import com.mapo.palantier.websocket.PureWebSocketHandler;
import com.mapo.palantier.websocket.WsMessage;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final PureWebSocketHandler pureWebSocketHandler;
    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat/{roomId}/send")
    public void sendMessage(
        @DestinationVariable Long roomId,
        com.mapo.palantier.chat.domain.ChatMessage message
    ) {
        log.debug("Room {} - Received message: {}", roomId, message);

        LocalDateTime now = LocalDateTime.now();

        chatMessageService.saveMessage(
            roomId,
            message.getSenderId(),
            message.getSenderName(),
            message.getContent(),
            message.getMessageType(),
            now
        );

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("roomId", roomId);
        data.put("senderId", message.getSenderId());
        data.put("senderName", message.getSenderName());
        data.put("content", message.getContent());
        data.put("messageType", message.getMessageType());
        data.put("createdAt", now.toString());

        pureWebSocketHandler.broadcast(
            "chat/" + roomId,
            new WsMessage("CHAT", "chat/" + roomId, data)
        );
    }
}
