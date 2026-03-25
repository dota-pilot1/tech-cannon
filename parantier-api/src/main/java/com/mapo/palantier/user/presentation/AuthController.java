package com.mapo.palantier.user.presentation;

import com.mapo.palantier.user.application.AuthService;
import com.mapo.palantier.user.domain.User;
import com.mapo.palantier.user.presentation.dto.AccessTokenResponse;
import com.mapo.palantier.user.presentation.dto.LoginRequest;
import com.mapo.palantier.user.presentation.dto.LoginResponse;
import com.mapo.palantier.user.presentation.dto.RefreshTokenRequest;
import com.mapo.palantier.user.presentation.dto.SignupRequest;
import com.mapo.palantier.user.presentation.dto.SignupResponse;
import com.mapo.palantier.user.presentation.dto.TokenResponse;
import com.mapo.palantier.user.presentation.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Tag(name = "인증", description = "회원가입, 로그인 등 인증 관련 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@RequestBody SignupRequest request) {
        User user = authService.signup(
                request.getEmail(),
                request.getPassword(),
                request.getUsername()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SignupResponse.from(user));
    }

    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인하여 액세스 토큰과 리프레시 토큰을 발급받습니다.")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        // 1. 로그인 처리 및 토큰 발급 (액세스 + 리프레시)
        TokenResponse tokenResponse = authService.login(request.getEmail(), request.getPassword());

        // 2. LoginResponse로 변환
        LoginResponse response = LoginResponse.of(
                tokenResponse.getAccessToken(),
                tokenResponse.getRefreshToken(),
                tokenResponse.getEmail(),
                tokenResponse.getUsername(),
                tokenResponse.getRole()
        );

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "액세스 토큰 재발급", description = "리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.")
    @PostMapping("/refresh")
    public ResponseEntity<AccessTokenResponse> refresh(@RequestBody @Valid RefreshTokenRequest request) {
        // 리프레시 토큰으로 새 액세스 토큰 발급
        String newAccessToken = authService.refreshAccessToken(request.getRefreshToken());

        return ResponseEntity.ok(AccessTokenResponse.of(newAccessToken));
    }

    @Operation(summary = "로그아웃", description = "리프레시 토큰을 무효화하여 로그아웃합니다.")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        // 현재 인증된 사용자 조회 후 로그아웃
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);
        authService.logout(user.getId());

        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "이메일 중복 체크", description = "회원가입 시 이메일 중복 여부를 확인합니다.")
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailDuplicate(@RequestParam String email) {
        boolean isDuplicate = authService.isEmailDuplicate(email);
        return ResponseEntity.ok(isDuplicate);
    }

    @Operation(summary = "현재 사용자 정보 조회", description = "JWT 토큰으로 인증된 현재 사용자의 정보를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
