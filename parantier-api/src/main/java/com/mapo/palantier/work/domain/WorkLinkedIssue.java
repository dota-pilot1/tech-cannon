package com.mapo.palantier.work.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkLinkedIssue {
    private Long id;
    private Long workId;
    private Long issueId;
    private String issueTitle;
    private String issueStatus;
    private String issuePriority;
    private LocalDateTime createdAt;
}
