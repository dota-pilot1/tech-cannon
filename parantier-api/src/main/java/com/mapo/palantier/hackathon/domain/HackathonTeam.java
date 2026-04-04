package com.mapo.palantier.hackathon.domain;

import java.time.LocalDateTime;
import java.util.List;

public class HackathonTeam {

    private Long id;
    private Long eventId;
    private String name;
    private String project;
    private String colorTheme;
    private Integer orderNum;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // DB 컬럼 아님 - 결과 조립용 (transient)
    private List<HackathonTeamMember> members;

    public HackathonTeam() {}

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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<HackathonTeamMember> getMembers() {
        return members;
    }

    public void setMembers(List<HackathonTeamMember> members) {
        this.members = members;
    }
}
