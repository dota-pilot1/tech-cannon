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
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        SubutaiFaqCategory existing = categoryMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "카테고리를 찾을 수 없습니다: " + id
                )
            );
        SubutaiFaqCategory category = SubutaiFaqCategory.builder()
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
        SubutaiFaqSection existing = sectionMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException("섹션을 찾을 수 없습니다: " + id)
            );
        SubutaiFaqSection section = SubutaiFaqSection.builder()
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

    public List<SubutaiFaqBlock> getBlocksBySectionId(Long sectionId) {
        return blockMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveBlocks(
        Long sectionId,
        List<SubutaiFaqBlockDto> blocks,
        Long userId
    ) {
        // 기존 블록 전체 삭제 후 재삽입
        blockMapper.deleteBySectionId(sectionId);
        if (blocks == null || blocks.isEmpty()) {
            return;
        }
        for (int i = 0; i < blocks.size(); i++) {
            SubutaiFaqBlockDto dto = blocks.get(i);
            SubutaiFaqBlock block = SubutaiFaqBlock.builder()
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
