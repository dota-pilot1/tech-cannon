package com.mapo.palantier.meeting.infrastructure;

import com.mapo.palantier.meeting.domain.MeetingChannel;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MeetingChannelMapper {
    /**
     * 활성화된 채널 목록 조회 (order_num 기준 오름차순)
     */
    List<MeetingChannel> findAllActive();

    /**
     * 채널 생성
     */
    void insert(MeetingChannel channel);

    /**
     * 채널 수정 (name, orderNum)
     */
    void update(MeetingChannel channel);

    /**
     * 채널 삭제
     */
    void delete(@Param("id") Long id);

    /**
     * 채널 순서 변경
     */
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
