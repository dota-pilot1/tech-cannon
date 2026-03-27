package com.mapo.palantier.issue.presentation.dto;

public class UpdateMessageRequest {
    private String message;

    public UpdateMessageRequest() {}

    public UpdateMessageRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
