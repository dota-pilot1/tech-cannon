package com.mapo.palantier.prompt.post;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class PromptDto {
    private Long id;
    private Long folderId;
    private String title;
    private String content;
    private Boolean isPinned;
    private List<String> tags;
}
