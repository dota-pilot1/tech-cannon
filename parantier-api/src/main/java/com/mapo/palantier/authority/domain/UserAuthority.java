package com.mapo.palantier.authority.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAuthority {
    private Long userId;
    private Long authorityId;
    private LocalDateTime grantedAt;
    private Long grantedBy;
    private LocalDateTime expiresAt;
    private String notes;

    // 권한 정보 (조회 시에만 사용)
    private Authority authority;

    // 만료 여부 확인
    public boolean isExpired() {
        if (expiresAt == null) {
            return false;
        }
        return LocalDateTime.now().isAfter(expiresAt);
    }

    // 유효한 권한인지 확인
    public boolean isValid() {
        return !isExpired();
    }
}
