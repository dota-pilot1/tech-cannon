package com.mapo.palantier.issue.domain;

public enum IssuePriority {
    LOW("낮음"),
    MEDIUM("보통"),
    HIGH("높음"),
    CRITICAL("긴급");

    private final String description;

    IssuePriority(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
