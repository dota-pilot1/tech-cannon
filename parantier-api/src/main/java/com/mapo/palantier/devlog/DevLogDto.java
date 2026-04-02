package com.mapo.palantier.devlog;

import lombok.Data;

@Data
public class DevLogDto {

    private Long id;
    private String title;
    private String content;
    private Integer sortOrder;
}
