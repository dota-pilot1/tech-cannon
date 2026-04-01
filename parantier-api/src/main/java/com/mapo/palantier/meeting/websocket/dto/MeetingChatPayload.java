package com.mapo.palantier.meeting.websocket.dto;

import java.time.LocalDateTime;

public class MeetingChatPayload {

    private Long id;
    private Long userId;
    private Long senderId;
    private String senderName;
    private String message;
    private Long channelId;
    private LocalDateTime createdAt;

    public MeetingChatPayload() {}

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

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getChannelId() {
        return channelId;
    }

    public void setChannelId(Long channelId) {
        this.channelId = channelId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return (
            "MeetingChatPayload{" +
            "id=" +
            id +
            ", userId=" +
            userId +
            ", senderId=" +
            senderId +
            ", senderName='" +
            senderName +
            '\'' +
            ", message='" +
            message +
            '\'' +
            ", channelId=" +
            channelId +
            ", createdAt=" +
            createdAt +
            '}'
        );
    }
}
