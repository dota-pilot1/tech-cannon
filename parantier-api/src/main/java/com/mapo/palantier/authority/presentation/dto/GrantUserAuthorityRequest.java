package com.mapo.palantier.authority.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GrantUserAuthorityRequest {
    private Long authorityId;
    private LocalDateTime expiresAt;  // null이면 영구 권한
    private String notes;
}
