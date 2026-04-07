package com.mapo.palantier.study.domain;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyCategory {

    private Long id;
    private String name;
    private Long parentId;
    private String icon;
    private String description;
    private Integer orderNum;
    private Boolean isActive;
    private Long authorId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 트리 구조용 (DB 컬럼 아님)
    private Integer depth;
    private List<StudyCategory> children;
}
