package com.mapo.palantier.user.presentation;

import com.mapo.palantier.authority.application.UserAuthorityService;
import com.mapo.palantier.authority.domain.Authority;
import com.mapo.palantier.authority.presentation.dto.UpdateUserAuthoritiesRequest;
import com.mapo.palantier.authority.presentation.dto.UserAuthorityResponse;
import com.mapo.palantier.config.JwtTokenProvider;
import com.mapo.palantier.user.application.UserService;
import com.mapo.palantier.user.domain.User;
import com.mapo.palantier.user.presentation.dto.UpdateRoleRequest;
import com.mapo.palantier.user.presentation.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "관리자 - 사용자 관리", description = "관리자 전용 사용자 관리 API")
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;
    private final UserAuthorityService userAuthorityService;
    private final JwtTokenProvider jwtTokenProvider;

    @Operation(summary = "전체 사용자 목록 조회", description = "관리자가 전체 사용자 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponse> response = users.stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "사용자 권한 변경", description = "관리자가 특정 사용자의 권한을 변경합니다.")
    @PatchMapping("/{userId}/role")
    public ResponseEntity<Void> updateUserRole(
            @PathVariable Long userId,
            @RequestBody @Valid UpdateRoleRequest request
    ) {
        userService.updateUserRole(userId, request.getRole());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "사용자 조직 일괄 변경", description = "관리자가 여러 사용자의 조직을 일괄 변경합니다.")
    @PatchMapping("/organization")
    public ResponseEntity<Void> updateUsersOrganization(
            @RequestParam List<Long> userIds,
            @RequestParam Long organizationId
    ) {
        userService.updateUsersOrganization(userIds, organizationId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "사용자 조직에서 제거", description = "관리자가 사용자를 조직에서 제거합니다 (미소속 상태로 변경).")
    @DeleteMapping("/{userId}/organization")
    public ResponseEntity<Void> removeUserFromOrganization(@PathVariable Long userId) {
        userService.removeUserFromOrganization(userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "사용자 권한 목록 조회", description = "특정 사용자의 권한 목록을 조회합니다.")
    @GetMapping("/{userId}/authorities")
    public ResponseEntity<List<UserAuthorityResponse>> getUserAuthorities(@PathVariable Long userId) {
        List<UserAuthorityResponse> authorities = userAuthorityService.getUserAuthorities(userId);
        return ResponseEntity.ok(authorities);
    }

    @Operation(summary = "전체 권한 목록 조회", description = "권한 할당에 사용할 전체 권한 목록을 조회합니다.")
    @GetMapping("/authorities/available")
    public ResponseEntity<List<Authority>> getAllAuthorities() {
        List<Authority> authorities = userAuthorityService.getAllAuthorities();
        return ResponseEntity.ok(authorities);
    }

    @Operation(summary = "사용자 권한 일괄 업데이트", description = "사용자의 권한을 일괄적으로 업데이트합니다.")
    @PutMapping("/{userId}/authorities")
    public ResponseEntity<Void> updateUserAuthorities(
            @PathVariable Long userId,
            @RequestBody @Valid UpdateUserAuthoritiesRequest request,
            HttpServletRequest httpRequest
    ) {
        // JWT 토큰에서 userId 추출
        String token = httpRequest.getHeader("Authorization").substring(7); // "Bearer " 제거
        Long grantedBy = jwtTokenProvider.getUserIdFromToken(token);

        userAuthorityService.updateUserAuthorities(userId, request.getAuthorityIds(), grantedBy);
        return ResponseEntity.noContent().build();
    }
}
