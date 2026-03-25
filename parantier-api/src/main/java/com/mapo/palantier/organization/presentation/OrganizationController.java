package com.mapo.palantier.organization.presentation;

import com.mapo.palantier.organization.application.OrganizationService;
import com.mapo.palantier.organization.domain.Organization;
import com.mapo.palantier.organization.presentation.dto.CreateOrganizationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {
    private final OrganizationService organizationService;

    /**
     * 조직 트리 구조 조회
     */
    @GetMapping("/tree")
    public ResponseEntity<List<Organization>> getOrganizationTree() {
        return ResponseEntity.ok(organizationService.getOrganizationTree());
    }

    /**
     * ID로 조직 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<Organization> getOrganization(@PathVariable Long id) {
        return ResponseEntity.ok(organizationService.getOrganizationById(id));
    }

    /**
     * 부모 ID로 자식 조직 조회
     */
    @GetMapping("/children/{parentId}")
    public ResponseEntity<List<Organization>> getChildOrganizations(@PathVariable Long parentId) {
        return ResponseEntity.ok(organizationService.getChildOrganizations(parentId));
    }

    /**
     * 조직 타입으로 조회
     */
    @GetMapping("/type/{orgType}")
    public ResponseEntity<List<Organization>> getOrganizationsByType(@PathVariable String orgType) {
        return ResponseEntity.ok(organizationService.getOrganizationsByType(orgType));
    }

    /**
     * 조직 생성
     */
    @PostMapping
    public ResponseEntity<Organization> createOrganization(@RequestBody CreateOrganizationRequest request) {
        Organization organization = Organization.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .parentId(request.getParentId())
                .orgType(request.getOrgType())
                .level(request.getLevel())
                .displayOrder(request.getDisplayOrder())
                .isActive(true)
                .build();

        return ResponseEntity.ok(organizationService.createOrganization(organization));
    }

    /**
     * 조직 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<Organization> updateOrganization(
            @PathVariable Long id,
            @RequestBody CreateOrganizationRequest request) {
        Organization organization = Organization.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .parentId(request.getParentId())
                .orgType(request.getOrgType())
                .level(request.getLevel())
                .displayOrder(request.getDisplayOrder())
                .build();

        return ResponseEntity.ok(organizationService.updateOrganization(id, organization));
    }

    /**
     * 조직 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrganization(@PathVariable Long id) {
        organizationService.deleteOrganization(id);
        return ResponseEntity.noContent().build();
    }
}
