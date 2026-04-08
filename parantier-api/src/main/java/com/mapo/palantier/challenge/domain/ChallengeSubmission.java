package com.mapo.palantier.challenge.domain;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeSubmission {
    private Long id;
    private Long sectionId;
    private Long userId;
    private String userName;
    private String language;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
