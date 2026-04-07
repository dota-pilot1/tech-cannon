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
public class ChatRoom {
    private Long id;
    private String name;
    private String roomType;
    private Long createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private Integer memberCount;

    public static ChatRoom create(String name, String roomType, Long createdBy) {
        return ChatRoom.builder()
            .name(name)
            .roomType(roomType)
            .createdBy(createdBy)
            .build();
    }

    public ChatRoom withId(Long id) {
        return ChatRoom.builder()
            .id(id)
            .name(this.name)
            .roomType(this.roomType)
            .createdBy(this.createdBy)
            .createdByName(this.createdByName)
            .createdAt(this.createdAt)
            .isActive(this.isActive)
            .memberCount(this.memberCount)
            .build();
    }
}
