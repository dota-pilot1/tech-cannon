package com.mapo.palantier.memo.presentation;

import com.mapo.palantier.memo.application.MemoService;
import com.mapo.palantier.memo.domain.Memo;
import com.mapo.palantier.memo.presentation.dto.MemoRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "메모", description = "개인 메모 API")
@RestController
@RequestMapping("/api/memos")
@RequiredArgsConstructor
public class MemoController {

    private final MemoService memoService;

    @Operation(summary = "내 메모 목록 조회")
    @GetMapping
    public ResponseEntity<List<Memo>> getMyMemos(
        @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(memoService.getMyMemos(userId));
    }

    @Operation(summary = "메모 생성")
    @PostMapping
    public ResponseEntity<Long> createMemo(
        @RequestBody @Valid MemoRequest request,
        @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(memoService.createMemo(request, userId));
    }

    @Operation(summary = "메모 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateMemo(
        @PathVariable Long id,
        @RequestBody @Valid MemoRequest request,
        @RequestAttribute("userId") Long userId
    ) {
        memoService.updateMemo(id, request, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "메모 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMemo(
        @PathVariable Long id,
        @RequestAttribute("userId") Long userId
    ) {
        memoService.deleteMemo(id, userId);
        return ResponseEntity.ok().build();
    }
}
