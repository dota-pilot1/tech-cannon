package com.mapo.palantier.user.presentation;

import com.mapo.palantier.user.application.UserService;
import com.mapo.palantier.user.domain.User;
import com.mapo.palantier.user.presentation.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "사용자", description = "로그인한 사용자라면 누구나 접근 가능한 사용자 관련 API")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(
        summary = "전체 사용자 목록 조회",
        description = "담당자 지정 등에 사용할 전체 활성 사용자 목록을 조회합니다. 로그인한 사용자라면 누구나 접근 가능합니다."
    )
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponse> response = users.stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
