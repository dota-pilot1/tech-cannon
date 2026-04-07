package com.mapo.palantier.user.presentation;

import com.mapo.palantier.upload.application.S3Service;
import com.mapo.palantier.user.application.UserService;
import com.mapo.palantier.user.domain.User;
import com.mapo.palantier.user.presentation.dto.ChangePasswordRequest;
import com.mapo.palantier.user.presentation.dto.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 프로필 관리 컨트롤러
 * 사용자가 본인의 정보를 조회/수정
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final S3Service s3Service;

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
        User updatedUser = user.withUsername(request.getUsername());
        userService.updateUser(updatedUser.getId(), updatedUser);

        return ResponseEntity.ok(updatedUser);
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
        if (
            !userService.verifyPassword(
                user.getId(),
                request.getCurrentPassword()
            )
        ) {
            return ResponseEntity.badRequest().build();
        }

        // 새 비밀번호로 변경
        userService.changePassword(user.getId(), request.getNewPassword());

        return ResponseEntity.ok().build();
    }

    /**
     * 프로필 이미지 업로드
     * POST /api/profile/image
     */
    @PostMapping("/image")
    public ResponseEntity<User> uploadProfileImage(
        @RequestParam("file") MultipartFile file,
        Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);

        // S3에 이미지 업로드
        String imageUrl = s3Service.uploadFile(file, "profile");

        // 프로필 이미지 URL 업데이트
        userService.updateProfileImage(user.getId(), imageUrl);

        // 업데이트된 사용자 정보 반환
        User updatedUser = userService.findById(user.getId());
        return ResponseEntity.ok(updatedUser);
    }
}
