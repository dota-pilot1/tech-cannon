package com.mapo.palantier.work.presentation.dto;

public class CreateWorkMessageRequest {
    private String message;

    public CreateWorkMessageRequest() {}

    public CreateWorkMessageRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
