package com.mapo.palantier.hackathon.dto;

public class CreateTeamRequest {

    private String name;
    private String project;
    private String colorTheme;

    public CreateTeamRequest() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProject() {
        return project;
    }

    public void setProject(String project) {
        this.project = project;
    }

    public String getColorTheme() {
        return colorTheme;
    }

    public void setColorTheme(String colorTheme) {
        this.colorTheme = colorTheme;
    }
}
