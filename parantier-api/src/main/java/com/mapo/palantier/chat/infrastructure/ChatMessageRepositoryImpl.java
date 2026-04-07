package com.mapo.palantier.chat.infrastructure;

import com.mapo.palantier.chat.domain.ChatMessageHistory;
import com.mapo.palantier.chat.domain.ChatMessageRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChatMessageRepositoryImpl implements ChatMessageRepository {

    private final ChatMessageMapper chatMessageMapper;

    @Override
    public void insert(ChatMessageHistory message) {
        chatMessageMapper.insert(message);
    }

    @Override
    public List<ChatMessageHistory> findByRoomId(Long roomId, int limit, Long beforeId) {
        return chatMessageMapper.findByRoomId(roomId, limit, beforeId);
    }

    @Override
    public int deleteOldMessages(LocalDateTime before) {
        return chatMessageMapper.deleteOldMessages(before);
    }

    @Override
    public int countByRoomId(Long roomId) {
        return chatMessageMapper.countByRoomId(roomId);
    }
}
