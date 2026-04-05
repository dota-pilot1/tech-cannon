package com.mapo.palantier.core.application;

import com.mapo.palantier.core.domain.CoreBlock;
import com.mapo.palantier.core.domain.CoreCategory;
import com.mapo.palantier.core.domain.CoreSection;
import com.mapo.palantier.core.dto.CoreBlockDto;
import com.mapo.palantier.core.dto.CoreCategoryRequest;
import com.mapo.palantier.core.dto.CoreReorderRequest.ReorderItem;
import com.mapo.palantier.core.dto.CoreSectionRequest;
import com.mapo.palantier.core.infrastructure.CoreBlockMapper;
import com.mapo.palantier.core.infrastructure.CoreCategoryMapper;
import com.mapo.palantier.core.infrastructure.CoreSectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CoreService {

    private final CoreCategoryMapper categoryMapper;
    private final CoreSectionMapper sectionMapper;
    private final CoreBlockMapper blockMapper;

    // ──────────────────────────────────────────
    // Category
    // ──────────────────────────────────────────

    public List<CoreCategory> getCategories() {
        return categoryMapper.findAll();
    }

    @Transactional
    public void createCategory(CoreCategoryRequest req) {
        CoreCategory category = CoreCategory.builder()
                .name(req.getName())
                .icon(req.getIcon())
                .emoji(req.getEmoji())
                .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
                .isActive(true)
                .build();
        categoryMapper.insert(category);
    }

    @Transactional
    public void updateCategory(Long id, CoreCategoryRequest req) {
        CoreCategory category = categoryMapper.findById(id)
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

    public List<CoreSection> getSectionsByCategoryId(Long categoryId) {
        return sectionMapper.findByCategoryId(categoryId);
    }

    @Transactional
    public void createSection(CoreSectionRequest req) {
        CoreSection section = CoreSection.builder()
                .categoryId(req.getCategoryId())
                .title(req.getTitle())
                .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
                .isActive(true)
                .build();
        sectionMapper.insert(section);
    }

    @Transactional
    public void updateSection(Long id, CoreSectionRequest req) {
        CoreSection section = sectionMapper.findById(id)
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

    public List<CoreBlock> getBlocksBySectionId(Long sectionId) {
        return blockMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveBlocks(Long sectionId, List<CoreBlockDto> blocks, Long userId) {
        // 기존 블록 전체 삭제 후 재삽입 (task 패턴 동일)
        blockMapper.deleteBySectionId(sectionId);
        if (blocks == null || blocks.isEmpty()) {
            return;
        }
        for (int i = 0; i < blocks.size(); i++) {
            CoreBlockDto dto = blocks.get(i);
            CoreBlock block = new CoreBlock();
            block.setSectionId(sectionId);
            block.setBlockType(dto.getBlockType());
            block.setContent(dto.getContent());
            block.setSortOrder(i);
            block.setUpdatedBy(userId);
            blockMapper.insert(block);
        }
    }
}
