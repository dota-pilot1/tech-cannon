package com.mapo.palantier.hackathon.application;

import com.mapo.palantier.hackathon.domain.HackathonEvent;
import com.mapo.palantier.hackathon.domain.HackathonTeam;
import com.mapo.palantier.hackathon.dto.CreateEventRequest;
import com.mapo.palantier.hackathon.dto.CreateTeamRequest;
import com.mapo.palantier.hackathon.dto.HackathonEventResponse;
import com.mapo.palantier.hackathon.dto.HackathonTeamResponse;
import com.mapo.palantier.hackathon.infrastructure.HackathonEventMapper;
import com.mapo.palantier.hackathon.infrastructure.HackathonTeamMapper;
import com.mapo.palantier.hackathon.infrastructure.HackathonTeamMemberMapper;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class HackathonEventService {

    private final HackathonEventMapper hackathonEventMapper;
    private final HackathonTeamMapper hackathonTeamMapper;
    private final HackathonTeamMemberMapper hackathonTeamMemberMapper;

    public HackathonEventService(
        HackathonEventMapper hackathonEventMapper,
        HackathonTeamMapper hackathonTeamMapper,
        HackathonTeamMemberMapper hackathonTeamMemberMapper
    ) {
        this.hackathonEventMapper = hackathonEventMapper;
        this.hackathonTeamMapper = hackathonTeamMapper;
        this.hackathonTeamMemberMapper = hackathonTeamMemberMapper;
    }

    /**
     * 활성 이벤트 단건 조회 (팀 + 멤버 조립)
     */
    public HackathonEventResponse getActiveEvent() {
        HackathonEvent event = hackathonEventMapper.findActive();
        if (event == null) {
            return null;
        }
        List<HackathonTeam> teams = hackathonTeamMapper.findByEventId(
            event.getId()
        );
        List<HackathonTeamResponse> teamResponses = new ArrayList<>();
        for (HackathonTeam team : teams) {
            teamResponses.add(buildTeamResponse(team));
        }
        return HackathonEventResponse.from(event, teamResponses);
    }

    /**
     * 전체 이벤트 목록 조회 (팀 + 멤버 조립)
     */
    public List<HackathonEventResponse> getAllEvents() {
        List<HackathonEvent> events = hackathonEventMapper.findAll();
        List<HackathonEventResponse> result = new ArrayList<>();
        for (HackathonEvent event : events) {
            List<HackathonTeam> teams = hackathonTeamMapper.findByEventId(
                event.getId()
            );
            List<HackathonTeamResponse> teamResponses = new ArrayList<>();
            for (HackathonTeam team : teams) {
                teamResponses.add(buildTeamResponse(team));
            }
            result.add(HackathonEventResponse.from(event, teamResponses));
        }
        return result;
    }

    /**
     * 이벤트 생성
     */
    @Transactional
    public Long createEvent(CreateEventRequest req) {
        HackathonEvent event = new HackathonEvent();
        event.setTitle(req.getTitle());
        event.setDescription(req.getDescription());
        event.setStartAt(req.getStartAt());
        event.setEndAt(req.getEndAt());
        event.setMaxTeams(req.getMaxTeams());
        event.setIsActive(true);
        hackathonEventMapper.insert(event);
        return event.getId();
    }

    /**
     * 이벤트 수정
     */
    @Transactional
    public void updateEvent(Long id, CreateEventRequest req) {
        HackathonEvent event = new HackathonEvent();
        event.setId(id);
        event.setTitle(req.getTitle());
        event.setDescription(req.getDescription());
        event.setStartAt(req.getStartAt());
        event.setEndAt(req.getEndAt());
        event.setMaxTeams(req.getMaxTeams());
        hackathonEventMapper.update(event);
    }

    /**
     * 팀 생성
     */
    @Transactional
    public Long createTeam(Long eventId, CreateTeamRequest req) {
        HackathonTeam team = new HackathonTeam();
        team.setEventId(eventId);
        team.setName(req.getName());
        team.setProject(req.getProject());
        team.setColorTheme(
            req.getColorTheme() != null ? req.getColorTheme() : "blue"
        );
        team.setOrderNum(req.getOrderNum() != null ? req.getOrderNum() : 0);
        hackathonTeamMapper.insert(team);
        return team.getId();
    }

    /**
     * 팀 수정
     */
    @Transactional
    public void updateTeam(Long teamId, CreateTeamRequest req) {
        HackathonTeam team = hackathonTeamMapper.findById(teamId);
        if (team == null) throw new IllegalArgumentException(
            "팀을 찾을 수 없습니다: " + teamId
        );
        team.setName(req.getName());
        team.setProject(req.getProject());
        if (req.getColorTheme() != null) team.setColorTheme(
            req.getColorTheme()
        );
        if (req.getOrderNum() != null) team.setOrderNum(req.getOrderNum());
        hackathonTeamMapper.update(team);
    }

    /**
     * 팀 삭제
     */
    @Transactional
    public void deleteTeam(Long teamId) {
        hackathonTeamMapper.deleteById(teamId);
    }

    /**
     * 팀 + 멤버 조립 헬퍼
     */
    private HackathonTeamResponse buildTeamResponse(HackathonTeam team) {
        team.setMembers(hackathonTeamMemberMapper.findByTeamId(team.getId()));
        return HackathonTeamResponse.from(team);
    }
}
