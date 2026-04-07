package com.mapo.palantier.frontend.application;

import com.mapo.palantier.frontend.domain.FrontendBlock;
import com.mapo.palantier.frontend.domain.FrontendCategory;
import com.mapo.palantier.frontend.domain.FrontendSection;
import com.mapo.palantier.frontend.dto.FrontendBlockDto;
import com.mapo.palantier.frontend.dto.FrontendCategoryRequest;
import com.mapo.palantier.frontend.dto.FrontendReorderRequest.ReorderItem;
import com.mapo.palantier.frontend.dto.FrontendSectionRequest;
import com.mapo.palantier.frontend.infrastructure.FrontendBlockMapper;
import com.mapo.palantier.frontend.infrastructure.FrontendCategoryMapper;
import com.mapo.palantier.frontend.infrastructure.FrontendSectionMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FrontendService {

    private final FrontendCategoryMapper categoryMapper;
    private final FrontendSectionMapper sectionMapper;
    private final FrontendBlockMapper blockMapper;

    // ──────────────────────────────────────────
    // Category
    // ──────────────────────────────────────────

    public List<FrontendCategory> getCategories() {
        return categoryMapper.findAll();
    }

    @Transactional
    public void createCategory(FrontendCategoryRequest req) {
        FrontendCategory category = FrontendCategory.builder()
            .name(req.getName())
            .icon(req.getIcon())
            .emoji(req.getEmoji())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true)
            .build();
        categoryMapper.insert(category);
    }

    @Transactional
    public void updateCategory(Long id, FrontendCategoryRequest req) {
        FrontendCategory existing = categoryMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "카테고리를 찾을 수 없습니다: " + id
                )
            );
        FrontendCategory category = FrontendCategory.builder()
            .id(existing.getId())
            .name(req.getName())
            .icon(req.getIcon())
            .emoji(req.getEmoji())
            .orderNum(
                req.getOrderNum() != null
                    ? req.getOrderNum()
                    : existing.getOrderNum()
            )
            .isActive(existing.getIsActive())
            .createdAt(existing.getCreatedAt())
            .build();
        categoryMapper.update(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryMapper.delete(id);
    }

    @Transactional
    public void reorderCategories(List<ReorderItem> items) {
        for (ReorderItem item : items) {
            categoryMapper.updateOrderNum(item.getId(), item.getOrderNum());
        }
    }

    // ──────────────────────────────────────────
    // Section
    // ──────────────────────────────────────────

    public List<FrontendSection> getSectionsByCategoryId(Long categoryId) {
        return sectionMapper.findByCategoryId(categoryId);
    }

    @Transactional
    public void createSection(FrontendSectionRequest req) {
        FrontendSection section = FrontendSection.builder()
            .categoryId(req.getCategoryId())
            .title(req.getTitle())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true)
            .build();
        sectionMapper.insert(section);
    }

    @Transactional
    public void updateSection(Long id, FrontendSectionRequest req) {
        FrontendSection existing = sectionMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException("섹션을 찾을 수 없습니다: " + id)
            );
        FrontendSection section = FrontendSection.builder()
            .id(existing.getId())
            .categoryId(
                req.getCategoryId() != null
                    ? req.getCategoryId()
                    : existing.getCategoryId()
            )
            .title(req.getTitle())
            .orderNum(
                req.getOrderNum() != null
                    ? req.getOrderNum()
                    : existing.getOrderNum()
            )
            .isActive(existing.getIsActive())
            .createdAt(existing.getCreatedAt())
            .build();
        sectionMapper.update(section);
    }

    @Transactional
    public void deleteSection(Long id) {
        sectionMapper.delete(id);
    }

    @Transactional
    public void reorderSections(List<ReorderItem> items) {
        for (ReorderItem item : items) {
            sectionMapper.updateOrderNum(item.getId(), item.getOrderNum());
        }
    }

    // ──────────────────────────────────────────
    // Block
    // ──────────────────────────────────────────

    public List<FrontendBlock> getBlocksBySectionId(Long sectionId) {
        return blockMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveBlocks(
        Long sectionId,
        List<FrontendBlockDto> blocks,
        Long userId
    ) {
        // 기존 블록 전체 삭제 후 재삽입 (task 패턴 동일)
        blockMapper.deleteBySectionId(sectionId);
        if (blocks == null || blocks.isEmpty()) {
            return;
        }
        for (int i = 0; i < blocks.size(); i++) {
            FrontendBlockDto dto = blocks.get(i);
            FrontendBlock block = FrontendBlock.builder()
                .sectionId(sectionId)
                .blockType(dto.getBlockType())
                .content(dto.getContent())
                .sortOrder(i)
                .updatedBy(userId)
                .build();
            blockMapper.insert(block);
        }
    }
}
