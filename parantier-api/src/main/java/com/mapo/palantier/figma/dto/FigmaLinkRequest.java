package com.mapo.palantier.figma.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class FigmaLinkRequest {
    private Long categoryId;
    private String title;
    private String url;
    private Integer orderNum;
}
