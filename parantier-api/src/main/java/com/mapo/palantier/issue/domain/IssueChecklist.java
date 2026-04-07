package com.mapo.palantier.issue.domain;

import lombok.Getter;
import lombok.Builder;

import java.time.LocalDateTime;

@Getter
@Builder
public class IssueChecklist {
    private Long id;
    private Long issueId;
    private String content;
    private Boolean checked;
    private Integer orderNum;
    private LocalDateTime createdAt;
}
