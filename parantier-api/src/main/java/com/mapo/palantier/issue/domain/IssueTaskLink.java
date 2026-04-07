package com.mapo.palantier.issue.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
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
