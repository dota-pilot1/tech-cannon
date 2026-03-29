package com.mapo.palantier.work.presentation.dto;

import com.mapo.palantier.work.domain.Work;
import java.time.LocalDateTime;

public class WorkResponse {

    private Long id;
    private String title;
    private String content;
    private String workType;
    private String status;
    private String priority;

    private Long reporterId;
    private String reporterName;

    private Long assigneeId;
    private String assigneeName;

    private Long organizationId;
    private String dueDate;
    private Integer orderNum;
    private Boolean isArchived;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WorkResponse from(Work work) {
        WorkResponse response = new WorkResponse();
        response.id = work.getId();
        response.title = work.getTitle();
        response.content = work.getContent();
        response.workType = work.getWorkType();
        response.status = work.getStatus();
        response.priority = work.getPriority();
        response.reporterId = work.getReporterId();
        response.reporterName = work.getReporterName();
        response.assigneeId = work.getAssigneeId();
        response.assigneeName = work.getAssigneeName();
        response.organizationId = work.getOrganizationId();
        response.dueDate = work.getDueDate();
        response.orderNum = work.getOrderNum();
        response.isArchived = work.getIsArchived();
        response.createdAt = work.getCreatedAt();
        response.updatedAt = work.getUpdatedAt();
        return response;
    }

    // Getters

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public String getWorkType() {
        return workType;
    }

    public String getStatus() {
        return status;
    }

    public String getPriority() {
        return priority;
    }

    public Long getReporterId() {
        return reporterId;
    }

    public String getReporterName() {
        return reporterName;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public String getAssigneeName() {
        return assigneeName;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public String getDueDate() {
        return dueDate;
    }

    public Integer getOrderNum() {
        return orderNum;
    }

    public Boolean getIsArchived() {
        return isArchived;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
