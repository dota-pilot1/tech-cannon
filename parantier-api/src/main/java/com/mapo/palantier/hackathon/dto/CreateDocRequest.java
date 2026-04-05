package com.mapo.palantier.hackathon.dto;

public class CreateDocRequest {

    private String title;
    private String content;

    public CreateDocRequest() {}

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
