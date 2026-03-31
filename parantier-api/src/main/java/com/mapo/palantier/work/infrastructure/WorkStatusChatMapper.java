package com.mapo.palantier.work.infrastructure;

import com.mapo.palantier.work.domain.WorkStatusChatMessage;
import com.mapo.palantier.work.domain.WorkStatusChatMessageWithUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WorkStatusChatMapper {

    /**
     * 최근 메시지 목록 조회 (작성자 정보 포함, 시간순 정렬)
     */
    List<WorkStatusChatMessageWithUser> findRecent(@Param("limit") int limit);

    /**
     * 메시지 생성
     */
    void insert(WorkStatusChatMessage message);
}
