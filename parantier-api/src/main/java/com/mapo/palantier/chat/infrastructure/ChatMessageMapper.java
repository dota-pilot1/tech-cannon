package com.mapo.palantier.chat.infrastructure;

import com.mapo.palantier.chat.domain.ChatMessageHistory;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ChatMessageMapper {
    void insert(ChatMessageHistory message);
    List<ChatMessageHistory> findByRoomId(
        @Param("roomId") Long roomId,
        @Param("limit") int limit,
        @Param("beforeId") Long beforeId
    );
    int deleteOldMessages(@Param("before") LocalDateTime before);
    int countByRoomId(@Param("roomId") Long roomId);
}
