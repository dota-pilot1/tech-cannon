package com.mapo.palantier.authority.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateAuthorityRequest {
    private String name;
    private String description;
    private Long categoryId;
}
