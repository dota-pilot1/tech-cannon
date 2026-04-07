package com.mapo.palantier.issue.domain;

import lombok.Getter;
import lombok.Builder;

import java.time.LocalDateTime;

@Getter
@Builder
public class IssueAssignee {
    private Long issueId;
    private Long userId;
    private String username;  // JOIN으로 가져올 사용자 이름
    private LocalDateTime assignedAt;
}
