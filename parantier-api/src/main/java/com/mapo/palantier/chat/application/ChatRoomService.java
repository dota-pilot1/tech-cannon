package com.mapo.palantier.chat.application;

import com.mapo.palantier.chat.domain.ChatRoom;
import com.mapo.palantier.chat.domain.ChatRoomRepository;
import com.mapo.palantier.chat.domain.RoomMember;
import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    public List<ChatRoom> getAllRooms() {
        return chatRoomRepository.findAll();
    }

    public List<ChatRoom> getRoomsByUserId(Long userId) {
        return chatRoomRepository.findByUserId(userId);
    }

    public ChatRoom getRoomById(Long id) {
        return chatRoomRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CHAT_ROOM_NOT_FOUND));
    }

    public List<RoomMember> getRoomMembers(Long roomId) {
        return chatRoomRepository.findMembersByRoomId(roomId);
    }

    @Transactional
    public Long createRoom(String name, String roomType, Long createdBy) {
        ChatRoom room = ChatRoom.create(name, roomType, createdBy);
        chatRoomRepository.insert(room);
        chatRoomRepository.joinRoom(room.getId(), createdBy);
        return room.getId();
    }

    @Transactional
    public void updateRoom(Long id, String name, String roomType) {
        ChatRoom existing = getRoomById(id);
        ChatRoom updated = existing.withId(id);
        chatRoomRepository.update(
            ChatRoom.builder()
                .id(id)
                .name(name)
                .roomType(roomType)
                .createdBy(existing.getCreatedBy())
                .build()
        );
    }

    @Transactional
    public void deleteRoom(Long id) {
        chatRoomRepository.delete(id);
    }

    @Transactional
    public void deleteAllRooms() {
        chatRoomRepository.deleteAll();
    }

    @Transactional
    public void joinRoom(Long roomId, Long userId) {
        chatRoomRepository.joinRoom(roomId, userId);
    }

    @Transactional
    public void leaveRoom(Long roomId, Long userId) {
        chatRoomRepository.leaveRoom(roomId, userId);
    }
}
