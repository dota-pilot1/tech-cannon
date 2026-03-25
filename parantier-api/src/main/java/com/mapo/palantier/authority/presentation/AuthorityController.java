package com.mapo.palantier.authority.presentation;

import com.mapo.palantier.authority.application.AuthorityService;
import com.mapo.palantier.authority.domain.Authority;
import com.mapo.palantier.authority.domain.UserAuthority;
import com.mapo.palantier.authority.presentation.dto.CreateAuthorityRequest;
import com.mapo.palantier.authority.presentation.dto.GrantUserAuthorityRequest;
import com.mapo.palantier.authority.presentation.dto.UpdateRoleMappingRequest;
import com.mapo.palantier.authority.presentation.dto.UserAuthorityResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/authorities")
@RequiredArgsConstructor
public class AuthorityController {

    private final AuthorityService authorityService;

    /**
     * 모든 권한 조회
     */
    @GetMapping
    public ResponseEntity<List<Authority>> getAllAuthorities() {
        List<Authority> authorities = authorityService.getAllAuthorities();
        return ResponseEntity.ok(authorities);
    }

    /**
     * 카테고리별 권한 조회
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Authority>> getAuthoritiesByCategory(@PathVariable String category) {
        List<Authority> authorities = authorityService.getAuthoritiesByCategory(category);
        return ResponseEntity.ok(authorities);
    }

    /**
     * 역할별 권한 조회
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<List<String>> getAuthoritiesByRole(@PathVariable String role) {
        List<String> authorities = authorityService.getAuthoritiesByRole(role);
        return ResponseEntity.ok(authorities);
    }

    /**
     * 권한 생성
     */
    @PostMapping
    public ResponseEntity<Authority> createAuthority(@RequestBody CreateAuthorityRequest request) {
        Authority authority = authorityService.createAuthority(
            request.getName(),
            request.getDescription(),
            request.getCategoryId()
        );
        return ResponseEntity.ok(authority);
    }

    /**
     * 권한 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<Authority> updateAuthority(
        @PathVariable Long id,
        @RequestBody CreateAuthorityRequest request
    ) {
        Authority authority = authorityService.updateAuthority(
            id,
            request.getName(),
            request.getDescription(),
            request.getCategoryId()
        );
        return ResponseEntity.ok(authority);
    }

    /**
     * 권한 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuthority(@PathVariable Long id) {
        authorityService.deleteAuthority(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 역할-권한 매핑 업데이트
     */
    @PutMapping("/role/{role}/mapping")
    public ResponseEntity<Void> updateRoleAuthorities(
        @PathVariable String role,
        @RequestBody UpdateRoleMappingRequest request
    ) {
        authorityService.updateRoleAuthorities(role, request.getAuthorityIds());
        return ResponseEntity.ok().build();
    }

    // ==================== 사용자별 권한 관리 ====================

    /**
     * 사용자의 개별 권한 목록 조회
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserAuthorityResponse>> getUserAuthorities(@PathVariable Long userId) {
        List<UserAuthority> userAuthorities = authorityService.getUserAuthorities(userId);
        List<UserAuthorityResponse> response = userAuthorities.stream()
                .map(UserAuthorityResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자의 유효한 권한만 조회
     */
    @GetMapping("/user/{userId}/valid")
    public ResponseEntity<List<UserAuthorityResponse>> getValidUserAuthorities(@PathVariable Long userId) {
        List<UserAuthority> userAuthorities = authorityService.getValidUserAuthorities(userId);
        List<UserAuthorityResponse> response = userAuthorities.stream()
                .map(UserAuthorityResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자에게 권한 부여
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<Void> grantUserAuthority(
            @PathVariable Long userId,
            @RequestBody GrantUserAuthorityRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // TODO: userDetails에서 실제 사용자 ID를 가져와야 함 (현재는 임시로 1L 사용)
        Long grantedBy = 1L;

        authorityService.grantUserAuthority(
                userId,
                request.getAuthorityId(),
                grantedBy,
                request.getExpiresAt(),
                request.getNotes()
        );
        return ResponseEntity.ok().build();
    }

    /**
     * 사용자 권한 회수
     */
    @DeleteMapping("/user/{userId}/authority/{authorityId}")
    public ResponseEntity<Void> revokeUserAuthority(
            @PathVariable Long userId,
            @PathVariable Long authorityId
    ) {
        authorityService.revokeUserAuthority(userId, authorityId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 사용자의 모든 개별 권한 회수
     */
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> revokeAllUserAuthorities(@PathVariable Long userId) {
        authorityService.revokeAllUserAuthorities(userId);
        return ResponseEntity.noContent().build();
    }
}
