package com.mapo.palantier.authority.presentation.dto;

import com.mapo.palantier.authority.domain.UserAuthority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class UserAuthorityResponse {
    private Long userId;
    private Long authorityId;
    private String authorityName;
    private String authorityDescription;
    private String authorityCategory;
    private LocalDateTime grantedAt;
    private Long grantedBy;
    private LocalDateTime expiresAt;
    private String notes;
    private boolean isExpired;

    public static UserAuthorityResponse from(UserAuthority userAuthority) {
        return UserAuthorityResponse.builder()
                .userId(userAuthority.getUserId())
                .authorityId(userAuthority.getAuthorityId())
                .authorityName(userAuthority.getAuthority().getName())
                .authorityDescription(userAuthority.getAuthority().getDescription())
                .authorityCategory(userAuthority.getAuthority().getCategory().getName())
                .grantedAt(userAuthority.getGrantedAt())
                .grantedBy(userAuthority.getGrantedBy())
                .expiresAt(userAuthority.getExpiresAt())
                .notes(userAuthority.getNotes())
                .isExpired(userAuthority.isExpired())
                .build();
    }
}
