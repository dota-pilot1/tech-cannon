package com.mapo.palantier.issue.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueTaskLink {
    private Long id;
    private Long issueId;
    private Long taskPostId;
    private Integer orderNum;
    private LocalDateTime createdAt;
}
