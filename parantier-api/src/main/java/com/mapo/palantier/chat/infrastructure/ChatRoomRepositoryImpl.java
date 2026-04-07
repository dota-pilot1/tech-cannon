package com.mapo.palantier.chat.infrastructure;

import com.mapo.palantier.chat.domain.ChatRoom;
import com.mapo.palantier.chat.domain.ChatRoomRepository;
import com.mapo.palantier.chat.domain.RoomMember;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChatRoomRepositoryImpl implements ChatRoomRepository {

    private final ChatRoomMapper chatRoomMapper;

    @Override
    public List<ChatRoom> findAll() {
        return chatRoomMapper.findAll();
    }

    @Override
    public List<ChatRoom> findByUserId(Long userId) {
        return chatRoomMapper.findRoomsByUserId(userId);
    }

    @Override
    public Optional<ChatRoom> findById(Long id) {
        return chatRoomMapper.findById(id);
    }

    @Override
    public List<RoomMember> findMembersByRoomId(Long roomId) {
        return chatRoomMapper.findMembersByRoomId(roomId);
    }

    @Override
    public void insert(ChatRoom chatRoom) {
        chatRoomMapper.insert(chatRoom);
    }

    @Override
    public void update(ChatRoom chatRoom) {
        chatRoomMapper.update(chatRoom);
    }

    @Override
    public void delete(Long id) {
        chatRoomMapper.delete(id);
    }

    @Override
    public void deleteAll() {
        chatRoomMapper.deleteAll();
    }

    @Override
    public void joinRoom(Long roomId, Long userId) {
        chatRoomMapper.joinRoom(roomId, userId);
    }

    @Override
    public void leaveRoom(Long roomId, Long userId) {
        chatRoomMapper.leaveRoom(roomId, userId);
    }
}
