package com.mapo.palantier.authority.presentation.dto;

import com.mapo.palantier.authority.domain.OrganizationAuthority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class OrganizationAuthorityResponse {
    private Long organizationId;
    private Long authorityId;
    private String authorityName;
    private String authorityDescription;
    private String authorityCategory;
    private LocalDateTime grantedAt;
    private Long grantedBy;
    private String notes;

    public static OrganizationAuthorityResponse from(OrganizationAuthority orgAuthority) {
        return OrganizationAuthorityResponse.builder()
                .organizationId(orgAuthority.getOrganizationId())
                .authorityId(orgAuthority.getAuthorityId())
                .authorityName(orgAuthority.getAuthority().getName())
                .authorityDescription(orgAuthority.getAuthority().getDescription())
                .authorityCategory(orgAuthority.getAuthority().getCategory().getName())
                .grantedAt(orgAuthority.getGrantedAt())
                .grantedBy(orgAuthority.getGrantedBy())
                .notes(orgAuthority.getNotes())
                .build();
    }
}
