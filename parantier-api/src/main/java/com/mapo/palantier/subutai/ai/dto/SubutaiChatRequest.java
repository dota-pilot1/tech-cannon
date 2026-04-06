package com.mapo.palantier.subutai.ai.dto;

import java.util.List;
import lombok.Data;

@Data
public class SubutaiChatRequest {

    private String question;
    private List<Long> githubItemIds;
    private List<Long> postIds; // Subutai Docu 문서 ID 목록
}
