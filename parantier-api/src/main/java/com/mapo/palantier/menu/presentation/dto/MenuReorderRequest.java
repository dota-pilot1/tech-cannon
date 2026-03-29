package com.mapo.palantier.menu.presentation.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MenuReorderRequest {
    private Long id;
    private Integer orderNum;
}
