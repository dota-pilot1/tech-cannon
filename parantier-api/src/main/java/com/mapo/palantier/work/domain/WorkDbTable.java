package com.mapo.palantier.work.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkDbTable {
    private Long id;
    private Long workId;
    private String tableName;
    private String tableInfo;
    private Integer orderNum;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
