package com.mapo.palantier.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    private Long id;
    private String name;
    private String roomType;  // TEAM, PROJECT, DIRECT
    private Long createdBy;
    private String createdByName;  // JOIN으로 가져올 생성자 이름
    private LocalDateTime createdAt;
    private Boolean isActive;
    private Integer memberCount;  // 참가자 수
}
