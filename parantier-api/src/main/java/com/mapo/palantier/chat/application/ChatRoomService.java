package com.mapo.palantier.chat.application;

import com.mapo.palantier.chat.domain.ChatMessageRepository;
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
    private final ChatMessageRepository chatMessageRepository;

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
        return createRoom(name, roomType, createdBy, null);
    }

    @Transactional
    public Long createRoom(String name, String roomType, Long createdBy, Long targetUserId) {
        ChatRoom room = ChatRoom.create(name, roomType, createdBy);
        chatRoomRepository.insert(room);
        chatRoomRepository.joinRoom(room.getId(), createdBy);
        // DIRECT 방이면 상대방도 같은 트랜잭션 내에서 자동 참가
        if ("DIRECT".equals(roomType) && targetUserId != null) {
            chatRoomRepository.joinRoom(room.getId(), targetUserId);
        }
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
        ChatRoom room = getRoomById(roomId);
        // DIRECT 방은 나가면 방 전체 삭제 (폭파)
        if ("DIRECT".equals(room.getRoomType())) {
            destroyRoom(roomId);
        } else {
            chatRoomRepository.leaveRoom(roomId, userId);
        }
    }

    /**
     * 방을 완전히 삭제: 메시지 → 멤버 → 방 순서로 hard delete
     */
    @Transactional
    public void destroyRoom(Long roomId) {
        chatMessageRepository.deleteByRoomId(roomId);
        chatRoomRepository.deleteAllMembers(roomId);
        chatRoomRepository.delete(roomId);
    }
}
