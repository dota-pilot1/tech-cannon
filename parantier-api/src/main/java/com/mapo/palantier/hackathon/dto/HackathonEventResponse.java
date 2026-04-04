package com.mapo.palantier.hackathon.dto;

import com.mapo.palantier.hackathon.domain.HackathonEvent;
import java.time.LocalDateTime;
import java.util.List;

public class HackathonEventResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Integer maxTeams;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private List<HackathonTeamResponse> teams;

    public HackathonEventResponse() {}

    public static HackathonEventResponse from(HackathonEvent event, List<HackathonTeamResponse> teams) {
        HackathonEventResponse response = new HackathonEventResponse();
        response.id = event.getId();
        response.title = event.getTitle();
        response.description = event.getDescription();
        response.startAt = event.getStartAt();
        response.endAt = event.getEndAt();
        response.maxTeams = event.getMaxTeams();
        response.isActive = event.getIsActive();
        response.createdAt = event.getCreatedAt();
        response.teams = teams;
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public void setStartAt(LocalDateTime startAt) {
        this.startAt = startAt;
    }

    public LocalDateTime getEndAt() {
        return endAt;
    }

    public void setEndAt(LocalDateTime endAt) {
        this.endAt = endAt;
    }

    public Integer getMaxTeams() {
        return maxTeams;
    }

    public void setMaxTeams(Integer maxTeams) {
        this.maxTeams = maxTeams;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<HackathonTeamResponse> getTeams() {
        return teams;
    }

    public void setTeams(List<HackathonTeamResponse> teams) {
        this.teams = teams;
    }
}
