package com.mapo.palantier.subutai.ai.domain;

import lombok.*;

@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class SubutaiDocTag {
    private Long id;
    private Long postId;
    private String tag;
}
