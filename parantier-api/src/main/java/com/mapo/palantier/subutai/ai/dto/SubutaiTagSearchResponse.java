package com.mapo.palantier.subutai.ai.dto;

import lombok.*;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubutaiTagSearchResponse {
    private Long postId;
    private String title;
    private String folderName;
    private List<String> tags;
}
