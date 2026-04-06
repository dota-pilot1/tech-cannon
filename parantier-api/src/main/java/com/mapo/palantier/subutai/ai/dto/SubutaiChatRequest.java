package com.mapo.palantier.subutai.ai.dto;

import lombok.Data;
import java.util.List;

@Data
public class SubutaiChatRequest {
    private String question;
    private List<Long> githubItemIds;
}
