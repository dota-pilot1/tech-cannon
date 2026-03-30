package com.mapo.palantier.authority.presentation;

import com.mapo.palantier.authority.application.OrganizationAuthorityService;
import com.mapo.palantier.authority.domain.OrganizationAuthority;
import com.mapo.palantier.authority.presentation.dto.OrganizationAuthorityResponse;
import com.mapo.palantier.authority.presentation.dto.UpdateOrganizationAuthoritiesRequest;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/authorities")
@RequiredArgsConstructor
public class OrganizationAuthorityController {

    private final OrganizationAuthorityService organizationAuthorityService;

    /**
     * 조직 권한 목록 조회
     * GET /api/authorities/organization/{orgId}
     */
    @GetMapping("/organization/{orgId}")
    public ResponseEntity<
        List<OrganizationAuthorityResponse>
    > getOrganizationAuthorities(@PathVariable Long orgId) {
        List<OrganizationAuthority> orgAuthorities =
            organizationAuthorityService.getOrganizationAuthorities(orgId);

        List<OrganizationAuthorityResponse> response = orgAuthorities
            .stream()
            .map(OrganizationAuthorityResponse::from)
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * 조직 권한 일괄 업데이트
     * PUT /api/authorities/organization/{orgId}
     * body: { "authorityIds": [1, 2, 3] }
     */
    @PutMapping("/organization/{orgId}")
    public ResponseEntity<Void> updateOrganizationAuthorities(
        @PathVariable Long orgId,
        @RequestBody UpdateOrganizationAuthoritiesRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        // TODO: userDetails에서 실제 사용자 ID를 가져와야 함 (현재는 임시로 1L 사용)
        Long grantedBy = 1L;

        organizationAuthorityService.updateOrganizationAuthorities(
            orgId,
            request.getAuthorityIds(),
            grantedBy
        );

        return ResponseEntity.ok().build();
    }

    /**
     * 팀원 권한 동기화
     * POST /api/authorities/organization/{orgId}/sync
     * - 해당 조직에 설정된 권한을 소속 팀원 전원의 user_authority에 즉시 추가
     * - 기존 개인 권한은 유지 (없는 것만 추가)
     */
    @PostMapping("/organization/{orgId}/sync")
    public ResponseEntity<Map<String, Object>> syncAuthoritiesToMembers(
        @PathVariable Long orgId,
        Authentication authentication
    ) {
        Long grantedBy =
            authentication != null
                ? Long.parseLong(authentication.getName())
                : 1L;

        int syncedCount = organizationAuthorityService.syncAuthoritiesToMembers(
            orgId,
            grantedBy
        );

        return ResponseEntity.ok(
            Map.of(
                "syncedMembers",
                syncedCount,
                "message",
                syncedCount + "명의 팀원에게 권한이 동기화되었습니다."
            )
        );
    }
}
