package com.mapo.palantier.hackathon.dto;

import com.mapo.palantier.hackathon.domain.HackathonTeam;
import com.mapo.palantier.hackathon.domain.HackathonTeamMember;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class HackathonTeamResponse {

    private Long id;
    private Long eventId;
    private String name;
    private String project;
    private String colorTheme;
    private Integer orderNum;
    private LocalDateTime createdAt;
    private List<MemberInfo> members;

    public HackathonTeamResponse() {}

    public static HackathonTeamResponse from(HackathonTeam team) {
        HackathonTeamResponse response = new HackathonTeamResponse();
        response.id = team.getId();
        response.eventId = team.getEventId();
        response.name = team.getName();
        response.project = team.getProject();
        response.colorTheme = team.getColorTheme();
        response.orderNum = team.getOrderNum();
        response.createdAt = team.getCreatedAt();

        List<MemberInfo> memberInfos = new ArrayList<>();
        if (team.getMembers() != null) {
            for (HackathonTeamMember m : team.getMembers()) {
                memberInfos.add(new MemberInfo(m.getUserId(), m.getUsername()));
            }
        }
        response.members = memberInfos;
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProject() {
        return project;
    }

    public void setProject(String project) {
        this.project = project;
    }

    public String getColorTheme() {
        return colorTheme;
    }

    public void setColorTheme(String colorTheme) {
        this.colorTheme = colorTheme;
    }

    public Integer getOrderNum() {
        return orderNum;
    }

    public void setOrderNum(Integer orderNum) {
        this.orderNum = orderNum;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<MemberInfo> getMembers() {
        return members;
    }

    public void setMembers(List<MemberInfo> members) {
        this.members = members;
    }

    // -----------------------------------------------------------------------
    // Inner static class
    // -----------------------------------------------------------------------

    public static class MemberInfo {

        private Long userId;
        private String username;

        public MemberInfo() {}

        public MemberInfo(Long userId, String username) {
            this.userId = userId;
            this.username = username;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }
    }
}
