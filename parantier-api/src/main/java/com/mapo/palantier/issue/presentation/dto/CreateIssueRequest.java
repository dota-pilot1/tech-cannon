package com.mapo.palantier.issue.presentation.dto;

import com.mapo.palantier.issue.domain.IssueCategory;
import com.mapo.palantier.issue.domain.IssuePriority;
import com.mapo.palantier.issue.domain.IssueStatus;

public class CreateIssueRequest {
    private String title;
    private String content;
    private IssueCategory category;
    private IssueStatus status;
    private IssuePriority priority;
    private Long assigneeId;
    private Long folderId;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public IssueCategory getCategory() {
        return category;
    }

    public void setCategory(IssueCategory category) {
        this.category = category;
    }

    public IssueStatus getStatus() {
        return status;
    }

    public void setStatus(IssueStatus status) {
        this.status = status;
    }

    public IssuePriority getPriority() {
        return priority;
    }

    public void setPriority(IssuePriority priority) {
        this.priority = priority;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }
}
