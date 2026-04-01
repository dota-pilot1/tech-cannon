package com.mapo.palantier.meeting.domain;

import java.time.LocalDateTime;

public class MeetingChannel {
    private Long id;
    private String name;
    private String slug;
    private Integer orderNum;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public MeetingChannel() {}

    public MeetingChannel(Long id, String name, String slug,
                          Integer orderNum, Boolean isActive, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.orderNum = orderNum;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public Integer getOrderNum() {
        return orderNum;
    }

    public void setOrderNum(Integer orderNum) {
        this.orderNum = orderNum;
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
}
