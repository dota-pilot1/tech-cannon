package com.mapo.palantier.memo;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Tag(name = "메모", description = "개인 메모 API")
@RestController
@RequestMapping("/api/memos")
@RequiredArgsConstructor
public class MemoController {

    private final MemoService memoService;

    @Operation(summary = "내 메모 목록 조회")
    @GetMapping
    public ResponseEntity<List<Memo>> getMyMemos(Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(memoService.getMyMemos(userId));
    }

    @Operation(summary = "메모 생성")
    @PostMapping
    public ResponseEntity<Long> createMemo(
        @RequestBody MemoDto dto,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(memoService.createMemo(dto, userId));
    }

    @Operation(summary = "메모 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateMemo(
        @PathVariable Long id,
        @RequestBody MemoDto dto,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        memoService.updateMemo(id, dto, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "메모 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMemo(
        @PathVariable Long id,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        memoService.deleteMemo(id, userId);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuth(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "로그인이 필요합니다"
            );
        }
        try {
            return (Long) auth.getPrincipal();
        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "유효하지 않은 인증 정보입니다"
            );
        }
    }
}
