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
public class SubutaiDocFolder {

    private Long id;
    private String name;
    private Integer orderNum;
    private Long createdBy;
    private LocalDateTime createdAt;
}
