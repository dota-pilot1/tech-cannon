package com.mapo.palantier.challenge.dto;

import lombok.Data;

@Data
public class ChallengeSubmissionRequest {
    private String githubUrl;
    private String content;
}
