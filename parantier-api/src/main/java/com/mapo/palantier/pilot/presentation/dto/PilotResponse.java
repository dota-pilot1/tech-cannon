package com.mapo.palantier.pilot.presentation.dto;

import com.mapo.palantier.pilot.domain.Pilot;
import java.time.LocalDateTime;

public class PilotResponse {

    private Long id;
    private String title;
    private String content;
    private String topic;
    private String status;
    private String priority;
    private Long reporterId;
    private String reporterName;
    private Long assigneeId;
    private String assigneeName;
    private String dueDate;
    private Integer orderNum;
    private Boolean isArchived;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PilotResponse from(Pilot pilot) {
        PilotResponse response = new PilotResponse();
        response.id = pilot.getId();
        response.title = pilot.getTitle();
        response.content = pilot.getContent();
        response.topic = pilot.getTopic();
        response.status = pilot.getStatus();
        response.priority = pilot.getPriority();
        response.reporterId = pilot.getReporterId();
        response.reporterName = pilot.getReporterName();
        response.assigneeId = pilot.getAssigneeId();
        response.assigneeName = pilot.getAssigneeName();
        response.dueDate = pilot.getDueDate();
        response.orderNum = pilot.getOrderNum();
        response.isArchived = pilot.getIsArchived();
        response.createdAt = pilot.getCreatedAt();
        response.updatedAt = pilot.getUpdatedAt();
        return response;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getTopic() { return topic; }
    public String getStatus() { return status; }
    public String getPriority() { return priority; }
    public Long getReporterId() { return reporterId; }
    public String getReporterName() { return reporterName; }
    public Long getAssigneeId() { return assigneeId; }
    public String getAssigneeName() { return assigneeName; }
    public String getDueDate() { return dueDate; }
    public Integer getOrderNum() { return orderNum; }
    public Boolean getIsArchived() { return isArchived; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
