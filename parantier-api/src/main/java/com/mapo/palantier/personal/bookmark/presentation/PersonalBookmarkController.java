package com.mapo.palantier.personal.bookmark.presentation;

import com.mapo.palantier.personal.bookmark.application.PersonalBookmarkService;
import com.mapo.palantier.personal.bookmark.domain.PersonalBookmark;
import com.mapo.palantier.personal.bookmark.presentation.dto.PersonalBookmarkRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@Tag(name = "개인 즐겨찾기", description = "개인 즐겨찾기 API")
@RestController
@RequestMapping("/api/personal-bookmarks")
@RequiredArgsConstructor
public class PersonalBookmarkController {

    private final PersonalBookmarkService personalBookmarkService;

    @Operation(summary = "내 즐겨찾기 목록 조회")
    @GetMapping
    public ResponseEntity<List<PersonalBookmark>> getMyBookmarks(
        @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(
            personalBookmarkService.getMyBookmarks(userId)
        );
    }

    @Operation(summary = "즐겨찾기 생성")
    @PostMapping
    public ResponseEntity<Long> createBookmark(
        @Valid @RequestBody PersonalBookmarkRequest dto,
        @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(
            personalBookmarkService.createBookmark(dto, userId)
        );
    }

    @Operation(summary = "즐겨찾기 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateBookmark(
        @PathVariable Long id,
        @Valid @RequestBody PersonalBookmarkRequest dto,
        @RequestAttribute("userId") Long userId
    ) {
        personalBookmarkService.updateBookmark(id, dto, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "즐겨찾기 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBookmark(
        @PathVariable Long id,
        @RequestAttribute("userId") Long userId
    ) {
        personalBookmarkService.deleteBookmark(id, userId);
        return ResponseEntity.ok().build();
    }
}
