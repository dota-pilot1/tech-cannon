package com.mapo.palantier.subutai.faq.application;

import com.mapo.palantier.subutai.faq.domain.SubutaiFaqBlock;
import com.mapo.palantier.subutai.faq.domain.SubutaiFaqCategory;
import com.mapo.palantier.subutai.faq.domain.SubutaiFaqSection;
import com.mapo.palantier.subutai.faq.dto.SubutaiFaqBlockDto;
import com.mapo.palantier.subutai.faq.dto.SubutaiFaqCategoryRequest;
import com.mapo.palantier.subutai.faq.dto.SubutaiFaqReorderRequest.ReorderItem;
import com.mapo.palantier.subutai.faq.dto.SubutaiFaqSectionRequest;
import com.mapo.palantier.subutai.faq.infrastructure.SubutaiFaqBlockMapper;
import com.mapo.palantier.subutai.faq.infrastructure.SubutaiFaqCategoryMapper;
import com.mapo.palantier.subutai.faq.infrastructure.SubutaiFaqSectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubutaiFaqService {

    private final SubutaiFaqCategoryMapper categoryMapper;
    private final SubutaiFaqSectionMapper sectionMapper;
    private final SubutaiFaqBlockMapper blockMapper;

    // ──────────────────────────────────────────
    // Category
    // ──────────────────────────────────────────

    public List<SubutaiFaqCategory> getCategories() {
        return categoryMapper.findAll();
    }

    @Transactional
    public void createCategory(SubutaiFaqCategoryRequest req) {
        SubutaiFaqCategory category = SubutaiFaqCategory.builder()
                .name(req.getName())
                .icon(req.getIcon())
                .emoji(req.getEmoji())
                .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
                .isActive(true)
                .build();
        categoryMapper.insert(category);
    }

    @Transactional
    public void updateCategory(Long id, SubutaiFaqCategoryRequest req) {
        SubutaiFaqCategory category = categoryMapper.findById(id)
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

    public List<SubutaiFaqSection> getSectionsByCategoryId(Long categoryId) {
        return sectionMapper.findByCategoryId(categoryId);
    }

    @Transactional
    public void createSection(SubutaiFaqSectionRequest req) {
        SubutaiFaqSection section = SubutaiFaqSection.builder()
                .categoryId(req.getCategoryId())
                .title(req.getTitle())
                .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
                .isActive(true)
                .build();
        sectionMapper.insert(section);
    }

    @Transactional
    public void updateSection(Long id, SubutaiFaqSectionRequest req) {
        SubutaiFaqSection section = sectionMapper.findById(id)
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

    public List<SubutaiFaqBlock> getBlocksBySectionId(Long sectionId) {
        return blockMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveBlocks(Long sectionId, List<SubutaiFaqBlockDto> blocks, Long userId) {
        // 기존 블록 전체 삭제 후 재삽입
        blockMapper.deleteBySectionId(sectionId);
        if (blocks == null || blocks.isEmpty()) {
            return;
        }
        for (int i = 0; i < blocks.size(); i++) {
            SubutaiFaqBlockDto dto = blocks.get(i);
            SubutaiFaqBlock block = new SubutaiFaqBlock();
            block.setSectionId(sectionId);
            block.setBlockType(dto.getBlockType());
            block.setContent(dto.getContent());
            block.setSortOrder(i);
            block.setUpdatedBy(userId);
            blockMapper.insert(block);
        }
    }
}
