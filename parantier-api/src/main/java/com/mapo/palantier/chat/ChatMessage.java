package com.mapo.palantier.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private Long id;
    private Long roomId;
    private Long senderId;
    private String senderName;
    private String content;
    private String messageType; // TEXT, FILE, IMAGE
    private LocalDateTime createdAt;

    // 테스트용 간단한 생성자
    public ChatMessage(Long senderId, String senderName, String content) {
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
        this.messageType = "TEXT";
        this.createdAt = LocalDateTime.now();
    }
}
