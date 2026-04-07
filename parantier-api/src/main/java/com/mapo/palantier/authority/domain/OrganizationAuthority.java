package com.mapo.palantier.authority.domain;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationAuthority {

    private Long organizationId;
    private Long authorityId;
    private LocalDateTime grantedAt;
    private Long grantedBy;
    private String notes;

    // 권한 정보 (JOIN 조회 시에만 사용)
    private Authority authority;
}
