package com.mapo.palantier.meeting.application;

import com.mapo.palantier.meeting.domain.MeetingChannel;
import com.mapo.palantier.meeting.infrastructure.MeetingChannelMapper;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class MeetingChannelService {

    private final MeetingChannelMapper meetingChannelMapper;

    public MeetingChannelService(MeetingChannelMapper meetingChannelMapper) {
        this.meetingChannelMapper = meetingChannelMapper;
    }

    /**
     * 활성 채널 전체 목록 조회
     */
    public List<MeetingChannel> getAll() {
        return meetingChannelMapper.findAllActive();
    }

    /**
     * 채널 생성
     * slug는 name 기반으로 자동 생성
     */
    @Transactional
    public MeetingChannel create(String name, String slug, int orderNum) {
        MeetingChannel channel = new MeetingChannel();
        channel.setName(name);
        channel.setSlug(slug);
        channel.setOrderNum(orderNum);
        channel.setIsActive(true);

        meetingChannelMapper.insert(channel);
        return channel;
    }

    /**
     * 채널 수정 (name, orderNum)
     */
    @Transactional
    public void update(Long id, String name, int orderNum) {
        MeetingChannel channel = new MeetingChannel();
        channel.setId(id);
        channel.setName(name);
        channel.setOrderNum(orderNum);

        meetingChannelMapper.update(channel);
    }

    /**
     * 채널 삭제
     */
    @Transactional
    public void delete(Long id) {
        meetingChannelMapper.delete(id);
    }

    /**
     * 채널 순서 일괄 변경
     * orders: [{id, orderNum}, ...] 형태의 리스트
     */
    @Transactional
    public void reorder(List<Map<String, Object>> orders) {
        for (Map<String, Object> order : orders) {
            Long id = Long.parseLong(order.get("id").toString());
            int orderNum = Integer.parseInt(order.get("orderNum").toString());
            meetingChannelMapper.updateOrderNum(id, orderNum);
        }
    }
}
