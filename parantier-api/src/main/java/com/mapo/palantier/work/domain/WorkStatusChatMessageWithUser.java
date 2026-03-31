package com.mapo.palantier.work.domain;

import java.time.LocalDateTime;

/**
 * 업무 현황 공용 채팅 메시지와 작성자 정보를 함께 담는 DTO (JOIN용)
 */
public class WorkStatusChatMessageWithUser {
    private Long id;
    private Long userId;
    private String message;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 작성자 정보 (JOIN용)
    private String username;
    private String userEmail;

    // 기본 생성자
    public WorkStatusChatMessageWithUser() {}

    // 전체 생성자
    public WorkStatusChatMessageWithUser(Long id, Long userId, String message,
                                         Boolean isDeleted, LocalDateTime createdAt,
                                         LocalDateTime updatedAt,
                                         String username, String userEmail) {
        this.id = id;
        this.userId = userId;
        this.message = message;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
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
