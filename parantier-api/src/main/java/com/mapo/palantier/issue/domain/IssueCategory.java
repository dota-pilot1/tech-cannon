package com.mapo.palantier.issue.domain;

public enum IssueCategory {
    COMMON("일반"),
    BUG("버그"),
    FEATURE("기능 요청"),
    IMPROVEMENT("개선"),
    QUESTION("질문");

    private final String description;

    IssueCategory(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
