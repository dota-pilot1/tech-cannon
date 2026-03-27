package com.mapo.palantier.issue.domain;

import java.time.LocalDateTime;

/**
 * 메시지와 작성자 정보를 함께 담는 DTO (JOIN용)
 */
public class MessageWithUser {
    private Long id;
    private Long issueId;
    private Long userId;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isDeleted;

    // 작성자 정보 (JOIN용)
    private String username;
    private String userEmail;

    // 기본 생성자
    public MessageWithUser() {}

    // 전체 생성자
    public MessageWithUser(Long id, Long issueId, Long userId, String message,
                           LocalDateTime createdAt, LocalDateTime updatedAt, Boolean isDeleted,
                           String username, String userEmail) {
        this.id = id;
        this.issueId = issueId;
        this.userId = userId;
        this.message = message;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isDeleted = isDeleted;
        this.username = username;
        this.userEmail = userEmail;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIssueId() {
        return issueId;
    }

    public void setIssueId(Long issueId) {
        this.issueId = issueId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
}
