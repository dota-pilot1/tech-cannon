package com.mapo.palantier.user.presentation;

import com.mapo.palantier.user.application.UserService;
import com.mapo.palantier.user.domain.User;
import com.mapo.palantier.user.presentation.dto.UpdateProfileRequest;
import com.mapo.palantier.user.presentation.dto.ChangePasswordRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 프로필 관리 컨트롤러
 * 사용자가 본인의 정보를 조회/수정
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    /**
     * 내 프로필 조회
     * GET /api/profile
     */
    @GetMapping
    public ResponseEntity<User> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(user);
    }

    /**
     * 프로필 수정 (사용자명만 수정 가능)
     * PUT /api/profile
     */
    @PutMapping
    public ResponseEntity<User> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);

        // 사용자명 업데이트
        user.setUsername(request.getUsername());
        userService.updateUser(user.getId(), user);

        return ResponseEntity.ok(user);
    }

    /**
     * 비밀번호 변경
     * POST /api/profile/password
     */
    @PostMapping("/password")
    public ResponseEntity<Void> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);

        // 현재 비밀번호 확인
        if (!userService.verifyPassword(user.getId(), request.getCurrentPassword())) {
            return ResponseEntity.badRequest().build();
        }

        // 새 비밀번호로 변경
        userService.changePassword(user.getId(), request.getNewPassword());

        return ResponseEntity.ok().build();
    }
}
