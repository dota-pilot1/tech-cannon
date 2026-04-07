package com.mapo.palantier.chat.domain;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository {
    void insert(ChatMessageHistory message);
    List<ChatMessageHistory> findByRoomId(Long roomId, int limit, Long beforeId);
    int deleteOldMessages(LocalDateTime before);
    int countByRoomId(Long roomId);
}
