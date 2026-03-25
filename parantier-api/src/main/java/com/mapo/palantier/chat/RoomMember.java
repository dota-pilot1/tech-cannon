package com.mapo.palantier.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomMember {
    private Long id;
    private Long roomId;
    private Long userId;
    private String username;  // JOIN으로 가져올 사용자 이름
    private String email;     // JOIN으로 가져올 이메일
    private LocalDateTime joinedAt;
    private LocalDateTime lastReadAt;
}
