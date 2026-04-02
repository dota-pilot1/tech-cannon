package com.mapo.palantier.personal.bookmark;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PersonalBookmarkDto {

    private Long id;
    private String title;
    private String url;
    private String description;
    private String category;
    private Integer sortOrder;
}
