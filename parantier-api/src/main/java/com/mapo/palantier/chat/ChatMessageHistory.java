package com.mapo.palantier.chat;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 채팅 메시지 히스토리 (DB 저장용)
 */
@Data
public class ChatMessageHistory {
    private Long id;
    private Long roomId;
    private Long senderId;
    private String senderName;
    private String content;
    private String messageType; // TEXT, IMAGE, FILE
    private LocalDateTime createdAt;
}
