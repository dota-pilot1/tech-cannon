package com.mapo.palantier.issue.domain;

public enum IssueStatus {
    OPEN("진행 전"),
    IN_PROGRESS("진행 중"),
    CLOSED("완료");

    private final String description;

    IssueStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
