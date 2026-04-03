package com.mapo.palantier.issue.domain;

public enum IssueStatus {
    TODO("대기"),
    IN_PROGRESS("진행 중"),
    TEST("테스트 중"),
    DONE("완료"),
    HOLD("보류"),
    BLOCKED("막힘");

    private final String description;

    IssueStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
