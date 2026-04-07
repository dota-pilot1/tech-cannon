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
public class IssueImage {
    private Long id;
    private Long issueId;
    private String url;
    private String filename;
    private String fileType;
    private LocalDateTime createdAt;
}
