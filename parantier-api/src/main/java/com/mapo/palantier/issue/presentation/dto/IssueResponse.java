package com.mapo.palantier.issue.presentation.dto;

import com.mapo.palantier.issue.domain.Issue;
import com.mapo.palantier.issue.domain.IssueCategory;
import com.mapo.palantier.issue.domain.IssuePriority;
import com.mapo.palantier.issue.domain.IssueStatus;
import java.time.LocalDateTime;

public class IssueResponse {

    private Long id;
    private String title;
    private String content;
    private IssueCategory category;
    private IssueStatus status;
    private IssuePriority priority;

    private Long authorId;
    private String authorName;
    private String authorEmail;

    private Long assigneeId;
    private String assigneeName;
    private String assigneeEmail;

    private Long folderId;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static IssueResponse from(Issue issue) {
        IssueResponse response = new IssueResponse();
        response.id = issue.getId();
        response.title = issue.getTitle();
        response.content = issue.getContent();
        response.category = issue.getCategory();
        response.status = issue.getStatus();
        response.priority = issue.getPriority();

        response.authorId = issue.getAuthorId();
        response.authorName = issue.getAuthorName();
        response.authorEmail = issue.getAuthorEmail();

        response.assigneeId = issue.getAssigneeId();
        response.assigneeName = issue.getAssigneeName();
        response.assigneeEmail = issue.getAssigneeEmail();

        response.folderId = issue.getFolderId();
        response.dueDate = issue.getDueDate();
        response.createdAt = issue.getCreatedAt();
        response.updatedAt = issue.getUpdatedAt();

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

    public IssueCategory getCategory() {
        return category;
    }

    public IssueStatus getStatus() {
        return status;
    }

    public IssuePriority getPriority() {
        return priority;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public String getAssigneeName() {
        return assigneeName;
    }

    public String getAssigneeEmail() {
        return assigneeEmail;
    }

    public Long getFolderId() {
        return folderId;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
