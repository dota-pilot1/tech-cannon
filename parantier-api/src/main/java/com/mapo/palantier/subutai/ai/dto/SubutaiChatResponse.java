package com.mapo.palantier.subutai.ai.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubutaiChatResponse {

    private String answer;
    private List<String> referencedUrls;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ReferencedDoc {

        private Long postId;
        private String title;
        private String folderName;
        private List<String> tags;
    }

    private List<ReferencedDoc> referencedDocs;
}
