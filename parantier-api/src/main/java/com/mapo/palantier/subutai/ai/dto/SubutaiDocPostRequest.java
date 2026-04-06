package com.mapo.palantier.subutai.ai.dto;

import lombok.Data;
import java.util.List;

@Data
public class SubutaiDocPostRequest {
    private Long folderId;
    private String title;
    private List<SubutaiDocSectionRequest> sections;
}
