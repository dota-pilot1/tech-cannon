package com.mapo.palantier.role.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleAuthority {
    private Long id;
    private Long roleId;
    private Long authorityId;
    private LocalDateTime createdAt;
}
