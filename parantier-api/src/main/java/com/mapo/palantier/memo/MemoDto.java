package com.mapo.palantier.memo;

import lombok.Data;

@Data
public class MemoDto {

    private Long id;
    private String title;
    private String content;
    private Integer sortOrder;
}
