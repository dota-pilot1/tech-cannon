package com.mapo.palantier.study;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StudyLikeResponse {

    private boolean liked;
    private long likeCount;
}
