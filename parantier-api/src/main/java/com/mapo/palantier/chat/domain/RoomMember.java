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
public class RoomMember {
    private Long id;
    private Long roomId;
    private Long userId;
    private String username;
    private String email;
    private LocalDateTime joinedAt;
    private LocalDateTime lastReadAt;
}
