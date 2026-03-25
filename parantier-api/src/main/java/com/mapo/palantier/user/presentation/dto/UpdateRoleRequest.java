package com.mapo.palantier.user.presentation.dto;

import com.mapo.palantier.user.domain.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoleRequest {
    @NotNull(message = "권한을 선택해주세요")
    private UserRole role;
}
