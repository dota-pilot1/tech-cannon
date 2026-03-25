package com.mapo.palantier.chat;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    /**
     * 클라이언트가 /app/chat.send 로 메시지를 전송하면
     * 이 메서드가 처리하고 /topic/messages 를 구독하는 모든 클라이언트에게 브로드캐스트
     */
    @MessageMapping("/chat.send")
    @SendTo("/topic/messages")
    public ChatMessage sendMessage(ChatMessage message) {
        // 메시지 수신 로그
        System.out.println("Received message: " + message);

        // 메시지 그대로 반환 (모든 구독자에게 전송)
        return message;
    }
}
