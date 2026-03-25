package com.mapo.palantier.authority.presentation.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCategoryRequest {
    private String name;
    private String description;
}
