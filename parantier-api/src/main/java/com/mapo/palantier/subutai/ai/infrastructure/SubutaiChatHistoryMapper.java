package com.mapo.palantier.subutai.ai.infrastructure;

import com.mapo.palantier.subutai.ai.domain.SubutaiChatHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SubutaiChatHistoryMapper {
    List<SubutaiChatHistory> findByUserId(@Param("userId") Long userId);
    void insert(SubutaiChatHistory history);
    void delete(@Param("id") Long id);
}
