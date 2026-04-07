package com.mapo.palantier.subutai.post;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubutaiPostTag {
    private Long id;
    private Long postId;
    private String tag;
}
