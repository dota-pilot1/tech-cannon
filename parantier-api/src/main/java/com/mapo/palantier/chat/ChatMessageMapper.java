package com.mapo.palantier.chat;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ChatMessageMapper {

    /**
     * 메시지 저장
     */
    void insert(ChatMessageHistory message);

    /**
     * 채팅방의 최근 메시지 조회 (페이지네이션)
     * @param roomId 채팅방 ID
     * @param limit 조회할 메시지 개수 (기본 50개)
     * @param beforeId 이 ID 이전의 메시지 조회 (무한 스크롤용, null이면 최신부터)
     */
    List<ChatMessageHistory> findByRoomId(
            @Param("roomId") Long roomId,
            @Param("limit") int limit,
            @Param("beforeId") Long beforeId
    );

    /**
     * 특정 기간 이전의 오래된 메시지 삭제 (자동 정리용)
     * @param before 이 시간 이전의 메시지 삭제
     */
    int deleteOldMessages(@Param("before") LocalDateTime before);

    /**
     * 채팅방의 메시지 개수 조회
     */
    int countByRoomId(@Param("roomId") Long roomId);
}
