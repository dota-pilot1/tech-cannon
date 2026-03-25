package com.mapo.palantier.role.presentation;

import com.mapo.palantier.role.application.RoleService;
import com.mapo.palantier.role.domain.Role;
import com.mapo.palantier.role.presentation.dto.RoleRequest;
import com.mapo.palantier.role.presentation.dto.RoleResponse;
import com.mapo.palantier.role.presentation.dto.UpdateRoleAuthoritiesRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    /**
     * 모든 역할 조회
     */
    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        List<Role> roles = roleService.getAllRoles();
        List<RoleResponse> responses = roles.stream()
                .map(RoleResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    /**
     * ID로 역할 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable Long id) {
        Role role = roleService.getRoleById(id);
        return ResponseEntity.ok(RoleResponse.from(role));
    }

    /**
     * 역할 생성
     */
    @PostMapping
    public ResponseEntity<RoleResponse> createRole(@RequestBody RoleRequest request) {
        Role role = roleService.createRole(request.getName(), request.getDescription());
        return ResponseEntity.ok(RoleResponse.from(role));
    }

    /**
     * 역할 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateRole(
            @PathVariable Long id,
            @RequestBody RoleRequest request
    ) {
        roleService.updateRole(id, request.getName(), request.getDescription());
        return ResponseEntity.ok().build();
    }

    /**
     * 역할 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 역할의 권한 목록 일괄 업데이트
     */
    @PutMapping("/{id}/authorities")
    public ResponseEntity<Void> updateRoleAuthorities(
            @PathVariable Long id,
            @RequestBody UpdateRoleAuthoritiesRequest request
    ) {
        roleService.updateRoleAuthorities(id, request.getAuthorityIds());
        return ResponseEntity.ok().build();
    }

    /**
     * 역할에 권한 추가
     */
    @PostMapping("/{roleId}/authorities/{authorityId}")
    public ResponseEntity<Void> addAuthorityToRole(
            @PathVariable Long roleId,
            @PathVariable Long authorityId
    ) {
        roleService.addAuthorityToRole(roleId, authorityId);
        return ResponseEntity.ok().build();
    }

    /**
     * 역할에서 권한 제거
     */
    @DeleteMapping("/{roleId}/authorities/{authorityId}")
    public ResponseEntity<Void> removeAuthorityFromRole(
            @PathVariable Long roleId,
            @PathVariable Long authorityId
    ) {
        roleService.removeAuthorityFromRole(roleId, authorityId);
        return ResponseEntity.ok().build();
    }
}
