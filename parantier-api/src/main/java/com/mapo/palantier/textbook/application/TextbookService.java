package com.mapo.palantier.textbook.application;

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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        TextbookCategory category = categoryMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다: " + id));
        category.setName(req.getName());
        category.setIcon(req.getIcon());
        category.setEmoji(req.getEmoji());
        if (req.getOrderNum() != null) {
            category.setOrderNum(req.getOrderNum());
        }
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
        TextbookSection section = sectionMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("섹션을 찾을 수 없습니다: " + id));
        section.setTitle(req.getTitle());
        if (req.getCategoryId() != null) {
            section.setCategoryId(req.getCategoryId());
        }
        if (req.getOrderNum() != null) {
            section.setOrderNum(req.getOrderNum());
        }
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
    public void saveBlocks(Long sectionId, List<TextbookBlockDto> blocks, Long userId) {
        // 기존 블록 전체 삭제 후 재삽입
        blockMapper.deleteBySectionId(sectionId);
        if (blocks == null || blocks.isEmpty()) {
            return;
        }
        for (int i = 0; i < blocks.size(); i++) {
            TextbookBlockDto dto = blocks.get(i);
            TextbookBlock block = new TextbookBlock();
            block.setSectionId(sectionId);
            block.setBlockType(dto.getBlockType());
            block.setContent(dto.getContent());
            block.setSortOrder(i);
            block.setUpdatedBy(userId);
            blockMapper.insert(block);
        }
    }
}
