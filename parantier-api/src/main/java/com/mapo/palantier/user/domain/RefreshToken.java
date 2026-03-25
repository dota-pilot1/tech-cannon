package com.mapo.palantier.user.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 리프레시 토큰 도메인 모델
 * - 액세스 토큰 재발급을 위한 장기 토큰
 * - DB에 저장하여 관리 (무효화 가능)
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    private Long id;
    private Long userId;           // User 엔티티의 ID
    private String token;          // JWT 리프레시 토큰
    private LocalDateTime expiryDate;
    private LocalDateTime createdAt;

    /**
     * 팩토리 메서드: 새 리프레시 토큰 생성
     */
    public static RefreshToken create(Long userId, String token, int validDays) {
        return RefreshToken.builder()
                .userId(userId)
                .token(token)
                .expiryDate(LocalDateTime.now().plusDays(validDays))
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * 도메인 로직: 만료 여부 확인
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }

    /**
     * 도메인 로직: 만료까지 남은 시간 (시간 단위)
     */
    public long getHoursUntilExpiry() {
        return java.time.Duration.between(LocalDateTime.now(), this.expiryDate).toHours();
    }
}
