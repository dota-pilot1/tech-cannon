package com.mapo.palantier.subutai.ai.domain;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
@Data
public class SubutaiDocPost {
    private Long id;
    private Long folderId;
    private String title;
    private Integer orderNum;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<SubutaiDocSection> sections;
}
