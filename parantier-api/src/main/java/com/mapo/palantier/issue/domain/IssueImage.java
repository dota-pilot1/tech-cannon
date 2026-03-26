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
public class IssueImage {
    private Long id;
    private Long issueId;
    private String url;
    private String filename;
    private LocalDateTime createdAt;
}
