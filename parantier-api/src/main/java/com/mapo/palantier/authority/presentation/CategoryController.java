package com.mapo.palantier.authority.presentation;

import com.mapo.palantier.authority.application.CategoryService;
import com.mapo.palantier.authority.domain.Category;
import com.mapo.palantier.authority.presentation.dto.CreateCategoryRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 모든 카테고리 조회
     */
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        log.info("=== GET /api/categories 요청 시작 ===");
        List<Category> categories = categoryService.getAllCategories();
        log.info("조회된 카테고리 개수: {}", categories.size());
        categories.forEach(cat -> log.info("  - ID: {}, Name: {}, Description: {}", cat.getId(), cat.getName(), cat.getDescription()));
        log.info("=== GET /api/categories 요청 완료 ===");
        return ResponseEntity.ok(categories);
    }

    /**
     * 카테고리 생성
     */
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody CreateCategoryRequest request) {
        Category category = categoryService.createCategory(request.getName(), request.getDescription());
        return ResponseEntity.ok(category);
    }

    /**
     * 카테고리 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestBody CreateCategoryRequest request) {
        Category category = categoryService.updateCategory(id, request.getName(), request.getDescription());
        return ResponseEntity.ok(category);
    }

    /**
     * 카테고리 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}
