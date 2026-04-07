package com.mapo.palantier.chat.domain;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageHistory {
    private Long id;
    private Long roomId;
    private Long senderId;
    private String senderName;
    private String content;
    private String messageType;
    private LocalDateTime createdAt;

    public static ChatMessageHistory create(
        Long roomId, Long senderId, String senderName,
        String content, String messageType, LocalDateTime createdAt
    ) {
        return ChatMessageHistory.builder()
            .roomId(roomId)
            .senderId(senderId)
            .senderName(senderName)
            .content(content)
            .messageType(messageType)
            .createdAt(createdAt)
            .build();
    }
}
