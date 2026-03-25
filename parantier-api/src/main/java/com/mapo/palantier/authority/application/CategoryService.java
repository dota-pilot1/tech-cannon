package com.mapo.palantier.authority.application;

import com.mapo.palantier.authority.domain.Category;
import com.mapo.palantier.authority.domain.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {
    private final CategoryRepository categoryRepository;

    /**
     * 모든 카테고리 조회
     */
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    /**
     * ID로 카테고리 조회
     */
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    /**
     * 카테고리 생성
     */
    @Transactional
    public Category createCategory(String name, String description) {
        // 중복 확인
        Category existing = categoryRepository.findByName(name);
        if (existing != null) {
            throw new IllegalArgumentException("Category with name '" + name + "' already exists");
        }

        Category category = Category.builder()
                .name(name)
                .description(description)
                .build();
        categoryRepository.create(category);
        log.info("Created category: {} (id={})", name, category.getId());
        return category;
    }

    /**
     * 카테고리 수정
     */
    @Transactional
    public Category updateCategory(Long id, String name, String description) {
        Category existing = categoryRepository.findById(id);
        if (existing == null) {
            throw new IllegalArgumentException("Category not found: " + id);
        }

        // 이름 변경 시 중복 확인
        if (!existing.getName().equals(name)) {
            Category duplicate = categoryRepository.findByName(name);
            if (duplicate != null) {
                throw new IllegalArgumentException("Category with name '" + name + "' already exists");
            }
        }

        Category category = Category.builder()
                .id(id)
                .name(name)
                .description(description)
                .build();
        categoryRepository.update(category);
        log.info("Updated category: {} (id={})", name, id);
        return category;
    }

    /**
     * 카테고리 삭제
     */
    @Transactional
    public void deleteCategory(Long id) {
        Category existing = categoryRepository.findById(id);
        if (existing == null) {
            throw new IllegalArgumentException("Category not found: " + id);
        }

        // FK 제약조건으로 인해 권한이 있으면 삭제 불가
        categoryRepository.delete(id);
        log.info("Deleted category: id={}", id);
    }
}
