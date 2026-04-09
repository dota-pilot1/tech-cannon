package com.mapo.palantier.chat.application;

import com.mapo.palantier.chat.domain.ChatMessageHistory;
import com.mapo.palantier.chat.domain.ChatMessageRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;

    public List<ChatMessageHistory> getMessages(Long roomId, int limit, Long beforeId) {
        return chatMessageRepository.findByRoomId(roomId, limit, beforeId);
    }

    @Transactional
    public void deleteByRoomId(Long roomId) {
        chatMessageRepository.deleteByRoomId(roomId);
    }

    @Transactional
    public void saveMessage(
        Long roomId, Long senderId, String senderName,
        String content, String messageType, LocalDateTime createdAt
    ) {
        ChatMessageHistory message = ChatMessageHistory.create(
            roomId, senderId, senderName, content, messageType, createdAt
        );
        chatMessageRepository.insert(message);
    }
}
