package com.mapo.palantier.hackathon.dto;

public class UpdateDocRequest {

    private String title;
    private String content;

    public UpdateDocRequest() {}

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
}
