package com.mapo.palantier.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomService {
    private final ChatRoomMapper chatRoomMapper;

    /**
     * 사용자가 참가한 채팅방 목록 조회
     */
    public List<ChatRoom> getRoomsByUserId(Long userId) {
        return chatRoomMapper.findRoomsByUserId(userId);
    }

    /**
     * 모든 채팅방 조회 (관리자용)
     */
    public List<ChatRoom> getAllRooms() {
        return chatRoomMapper.findAll();
    }

    /**
     * 채팅방 상세 조회
     */
    public ChatRoom getRoomById(Long id) {
        return chatRoomMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다: " + id));
    }

    /**
     * 채팅방 참가자 목록 조회
     */
    public List<RoomMember> getRoomMembers(Long roomId) {
        return chatRoomMapper.findMembersByRoomId(roomId);
    }

    /**
     * 채팅방 생성
     */
    @Transactional
    public Long createRoom(ChatRoom chatRoom) {
        chatRoomMapper.insert(chatRoom);

        // 생성자를 자동으로 참가시킴
        chatRoomMapper.joinRoom(chatRoom.getId(), chatRoom.getCreatedBy());

        return chatRoom.getId();
    }

    /**
     * 채팅방 수정
     */
    @Transactional
    public void updateRoom(ChatRoom chatRoom) {
        chatRoomMapper.update(chatRoom);
    }

    /**
     * 채팅방 삭제 (hard delete)
     */
    @Transactional
    public void deleteRoom(Long id) {
        chatRoomMapper.delete(id);
    }

    /**
     * 모든 채팅방 삭제 (관리자용)
     * CASCADE 설정으로 참가자도 자동 삭제됨
     */
    @Transactional
    public void deleteAllRooms() {
        chatRoomMapper.deleteAll();
    }

    /**
     * 채팅방 참가
     */
    @Transactional
    public void joinRoom(Long roomId, Long userId) {
        chatRoomMapper.joinRoom(roomId, userId);
    }

    /**
     * 채팅방 나가기
     */
    @Transactional
    public void leaveRoom(Long roomId, Long userId) {
        chatRoomMapper.leaveRoom(roomId, userId);

        // 남은 참가자가 0명이면 채팅방 삭제 (hard delete)
        List<RoomMember> remainingMembers = chatRoomMapper.findMembersByRoomId(roomId);
        if (remainingMembers.isEmpty()) {
            chatRoomMapper.delete(roomId);
        }
    }
}
