package com.mapo.palantier.issue.domain;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class IssueAssignee {
    private Long issueId;
    private Long userId;
    private String username;  // JOIN으로 가져올 사용자 이름
    private LocalDateTime assignedAt;
}
