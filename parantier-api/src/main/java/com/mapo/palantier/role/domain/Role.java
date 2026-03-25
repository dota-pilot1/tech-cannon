package com.mapo.palantier.role.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    private Long id;
    private String name;              // 예: ADMIN, MANAGER, MEMBER
    private String description;       // 역할 설명
    private LocalDateTime createdAt;

    // JOIN 결과용 필드
    private List<Long> authorityIds;  // 이 역할이 가진 권한 ID 목록
}
