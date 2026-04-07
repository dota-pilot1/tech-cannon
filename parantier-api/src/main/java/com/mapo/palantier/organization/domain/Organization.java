package com.mapo.palantier.organization.domain;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Organization {

    private Long id;
    private String name;
    private String code;
    private String description;
    private Long parentId;
    private String orgType; // COMPANY, DEPARTMENT, TEAM
    private Integer level;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;

    // 트리 구조를 위한 필드 (조회 시에만 사용)
    private List<Organization> children;

    // 도메인 메서드: 조직 비활성화
    public Organization deactivate(Long updatedBy) {
        return Organization.builder()
            .id(this.id)
            .name(this.name)
            .code(this.code)
            .description(this.description)
            .parentId(this.parentId)
            .orgType(this.orgType)
            .level(this.level)
            .displayOrder(this.displayOrder)
            .isActive(false)
            .createdAt(this.createdAt)
            .updatedAt(LocalDateTime.now())
            .createdBy(this.createdBy)
            .updatedBy(updatedBy)
            .build();
    }

    // 도메인 메서드: 조직 활성화
    public Organization activate(Long updatedBy) {
        return Organization.builder()
            .id(this.id)
            .name(this.name)
            .code(this.code)
            .description(this.description)
            .parentId(this.parentId)
            .orgType(this.orgType)
            .level(this.level)
            .displayOrder(this.displayOrder)
            .isActive(true)
            .createdAt(this.createdAt)
            .updatedAt(LocalDateTime.now())
            .createdBy(this.createdBy)
            .updatedBy(updatedBy)
            .build();
    }

    // 도메인 메서드: 조직 정보 수정
    public Organization withUpdated(
        String name,
        String description,
        Long parentId,
        Integer displayOrder,
        Long updatedBy
    ) {
        return Organization.builder()
            .id(this.id)
            .name(name != null ? name : this.name)
            .code(this.code)
            .description(description != null ? description : this.description)
            .parentId(parentId != null ? parentId : this.parentId)
            .orgType(this.orgType)
            .level(this.level)
            .displayOrder(
                displayOrder != null ? displayOrder : this.displayOrder
            )
            .isActive(this.isActive)
            .createdAt(this.createdAt)
            .updatedAt(LocalDateTime.now())
            .createdBy(this.createdBy)
            .updatedBy(updatedBy)
            .build();
    }

    // 도메인 판단: 최상위 조직 여부
    public boolean isRootOrganization() {
        return this.parentId == null;
    }

    // 도메인 판단: 회사 타입 여부
    public boolean isCompany() {
        return "COMPANY".equals(this.orgType);
    }
}
