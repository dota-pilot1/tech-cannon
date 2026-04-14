package com.mapo.palantier.skillcore.dto;
import lombok.Data;
@Data
public class SkillCoreSectionRequest {
    private Long categoryId;
    private String title;
    private Integer orderNum;
}
