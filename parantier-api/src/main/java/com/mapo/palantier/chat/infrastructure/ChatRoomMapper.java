package com.mapo.palantier.chat.infrastructure;

import com.mapo.palantier.chat.domain.ChatRoom;
import com.mapo.palantier.chat.domain.RoomMember;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ChatRoomMapper {
    List<ChatRoom> findAll();
    List<ChatRoom> findRoomsByUserId(@Param("userId") Long userId);
    Optional<ChatRoom> findById(@Param("id") Long id);
    List<RoomMember> findMembersByRoomId(@Param("roomId") Long roomId);
    void insert(ChatRoom chatRoom);
    void update(ChatRoom chatRoom);
    void delete(@Param("id") Long id);
    void deleteAll();
    void joinRoom(@Param("roomId") Long roomId, @Param("userId") Long userId);
    void leaveRoom(@Param("roomId") Long roomId, @Param("userId") Long userId);
}
