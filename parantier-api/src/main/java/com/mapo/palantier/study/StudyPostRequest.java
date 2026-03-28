package com.mapo.palantier.study;

import lombok.Data;

@Data
public class StudyPostRequest {

    private Long categoryId;
    private String title;
    private String content;
    private Boolean isPublic = true;
}
