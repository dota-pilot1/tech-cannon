package com.mapo.palantier.chat.domain;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository {
    List<ChatRoom> findAll();
    List<ChatRoom> findByUserId(Long userId);
    Optional<ChatRoom> findById(Long id);
    List<RoomMember> findMembersByRoomId(Long roomId);
    void insert(ChatRoom chatRoom);
    void update(ChatRoom chatRoom);
    void delete(Long id);
    void deleteAll();
    void joinRoom(Long roomId, Long userId);
    void leaveRoom(Long roomId, Long userId);
}
