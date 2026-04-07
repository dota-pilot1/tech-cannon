package com.mapo.palantier.subutai.ai.domain;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubutaiChatHistory {

    private Long id;
    private Long userId;
    private String question;
    private String answer;
    private String[] githubUrls;
    private LocalDateTime createdAt;
}
