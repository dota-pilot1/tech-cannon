package com.mapo.palantier.issue.domain;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class IssueChecklist {
    private Long id;
    private Long issueId;
    private String content;
    private Boolean checked;
    private Integer orderNum;
    private LocalDateTime createdAt;
}
