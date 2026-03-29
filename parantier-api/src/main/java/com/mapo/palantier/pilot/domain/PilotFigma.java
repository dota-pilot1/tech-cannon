package com.mapo.palantier.pilot.domain;

import java.time.LocalDateTime;

public class PilotFigma {
    private Long id;
    private Long pilotId;
    private String title;
    private String url;
    private String description;
    private Integer orderNum;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PilotFigma() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPilotId() { return pilotId; }
    public void setPilotId(Long pilotId) { this.pilotId = pilotId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getOrderNum() { return orderNum; }
    public void setOrderNum(Integer orderNum) { this.orderNum = orderNum; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
