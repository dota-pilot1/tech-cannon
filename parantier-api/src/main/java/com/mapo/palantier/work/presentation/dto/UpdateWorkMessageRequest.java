package com.mapo.palantier.work.presentation.dto;

public class UpdateWorkMessageRequest {
    private String message;

    public UpdateWorkMessageRequest() {}

    public UpdateWorkMessageRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
