package com.mapo.palantier.chat.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChatRoomRequest {

    @NotBlank(message = "채팅방 이름을 입력해주세요")
    private String name;

    private String roomType;
}
