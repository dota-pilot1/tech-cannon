package com.mapo.palantier.issue.domain;

public enum IssueStatus {
    OPEN("진행 전"),
    IN_PROGRESS("진행 중"),
    RESOLVED("해결됨"),
    CLOSED("종료됨"),
    REJECTED("거부됨");

    private final String description;

    IssueStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
