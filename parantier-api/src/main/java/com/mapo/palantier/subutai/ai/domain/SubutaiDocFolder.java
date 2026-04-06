package com.mapo.palantier.subutai.ai.domain;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class SubutaiDocFolder {
    private Long id;
    private String name;
    private Integer orderNum;
    private Long createdBy;
    private LocalDateTime createdAt;
}
