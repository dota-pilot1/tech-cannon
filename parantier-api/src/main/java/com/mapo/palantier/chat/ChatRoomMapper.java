package com.mapo.palantier.chat;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ChatRoomMapper {
    // 채팅방 목록 조회 (사용자가 참가한 방만)
    List<ChatRoom> findRoomsByUserId(@Param("userId") Long userId);

    // 모든 채팅방 조회
    List<ChatRoom> findAll();

    // 채팅방 상세 조회
    Optional<ChatRoom> findById(@Param("id") Long id);

    // 채팅방 생성
    void insert(ChatRoom chatRoom);

    // 채팅방 수정
    void update(ChatRoom chatRoom);

    // 채팅방 삭제 (hard delete)
    void delete(@Param("id") Long id);

    // 모든 채팅방 삭제 (관리자용)
    void deleteAll();

    // 채팅방 참가자 목록
    List<RoomMember> findMembersByRoomId(@Param("roomId") Long roomId);

    // 채팅방 참가
    void joinRoom(@Param("roomId") Long roomId, @Param("userId") Long userId);

    // 채팅방 나가기
    void leaveRoom(@Param("roomId") Long roomId, @Param("userId") Long userId);
}
