package com.mapo.palantier.textbook.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.textbook.domain.TextbookBlock;
import com.mapo.palantier.textbook.domain.TextbookCategory;
import com.mapo.palantier.textbook.domain.TextbookSection;
import com.mapo.palantier.textbook.dto.TextbookBlockDto;
import com.mapo.palantier.textbook.dto.TextbookCategoryRequest;
import com.mapo.palantier.textbook.dto.TextbookReorderRequest.ReorderItem;
import com.mapo.palantier.textbook.dto.TextbookSectionRequest;
import com.mapo.palantier.textbook.infrastructure.TextbookBlockMapper;
import com.mapo.palantier.textbook.infrastructure.TextbookCategoryMapper;
import com.mapo.palantier.textbook.infrastructure.TextbookSectionMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TextbookService {

    private final TextbookCategoryMapper categoryMapper;
    private final TextbookSectionMapper sectionMapper;
    private final TextbookBlockMapper blockMapper;

    // ──────────────────────────────────────────
    // Category
    // ──────────────────────────────────────────

    public List<TextbookCategory> getCategories() {
        return categoryMapper.findAll();
    }

    @Transactional
    public void createCategory(TextbookCategoryRequest req) {
        TextbookCategory category = TextbookCategory.builder()
            .name(req.getName())
            .icon(req.getIcon())
            .emoji(req.getEmoji())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true)
            .build();
        categoryMapper.insert(category);
    }

    @Transactional
    public void updateCategory(Long id, TextbookCategoryRequest req) {
        TextbookCategory existing = categoryMapper
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    ErrorCode.TEXTBOOK_CATEGORY_NOT_FOUND
                )
            );
        TextbookCategory category = TextbookCategory.builder()
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

    public List<TextbookSection> getSectionsByCategoryId(Long categoryId) {
        return sectionMapper.findByCategoryId(categoryId);
    }

    @Transactional
    public void createSection(TextbookSectionRequest req) {
        TextbookSection section = TextbookSection.builder()
            .categoryId(req.getCategoryId())
            .title(req.getTitle())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true)
            .build();
        sectionMapper.insert(section);
    }

    @Transactional
    public void updateSection(Long id, TextbookSectionRequest req) {
        TextbookSection existing = sectionMapper
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    ErrorCode.TEXTBOOK_SECTION_NOT_FOUND
                )
            );
        TextbookSection section = TextbookSection.builder()
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

    public List<TextbookBlock> getBlocksBySectionId(Long sectionId) {
        return blockMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveBlocks(
        Long sectionId,
        List<TextbookBlockDto> blocks,
        Long userId
    ) {
        // 기존 블록 전체 삭제 후 재삽입
        blockMapper.deleteBySectionId(sectionId);
        if (blocks == null || blocks.isEmpty()) {
            return;
        }
        for (int i = 0; i < blocks.size(); i++) {
            TextbookBlockDto dto = blocks.get(i);
            TextbookBlock block = TextbookBlock.builder()
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
