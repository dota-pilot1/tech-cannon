package com.mapo.palantier.authority.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoleMappingRequest {
    private List<Long> authorityIds;
}
