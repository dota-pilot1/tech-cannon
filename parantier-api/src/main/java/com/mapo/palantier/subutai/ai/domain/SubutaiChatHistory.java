package com.mapo.palantier.subutai.ai.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubutaiChatHistory {
    private Long id;
    private Long userId;
    private String question;
    private String answer;
    private String[] githubUrls;
    private LocalDateTime createdAt;
}
