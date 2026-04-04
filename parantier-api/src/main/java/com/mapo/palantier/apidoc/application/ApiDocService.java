package com.mapo.palantier.apidoc.application;

import com.mapo.palantier.apidoc.domain.ApiDocBlock;
import com.mapo.palantier.apidoc.domain.ApiDocCategory;
import com.mapo.palantier.apidoc.domain.ApiDocSection;
import com.mapo.palantier.apidoc.dto.ApiDocBlockDto;
import com.mapo.palantier.apidoc.dto.ApiDocCategoryRequest;
import com.mapo.palantier.apidoc.dto.ApiDocReorderRequest.ReorderItem;
import com.mapo.palantier.apidoc.dto.ApiDocSectionRequest;
import com.mapo.palantier.apidoc.infrastructure.ApiDocBlockMapper;
import com.mapo.palantier.apidoc.infrastructure.ApiDocCategoryMapper;
import com.mapo.palantier.apidoc.infrastructure.ApiDocSectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApiDocService {

    private final ApiDocCategoryMapper categoryMapper;
    private final ApiDocSectionMapper sectionMapper;
    private final ApiDocBlockMapper blockMapper;

    // ──────────────────────────────────────────
    // Category
    // ──────────────────────────────────────────

    public List<ApiDocCategory> getCategories() {
        return categoryMapper.findAll();
    }

    @Transactional
    public void createCategory(ApiDocCategoryRequest req) {
        ApiDocCategory category = ApiDocCategory.builder()
                .name(req.getName())
                .icon(req.getIcon())
                .emoji(req.getEmoji())
                .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
                .isActive(true)
                .build();
        categoryMapper.insert(category);
    }

    @Transactional
    public void updateCategory(Long id, ApiDocCategoryRequest req) {
        ApiDocCategory category = categoryMapper.findById(id)
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

    public List<ApiDocSection> getSectionsByCategoryId(Long categoryId) {
        return sectionMapper.findByCategoryId(categoryId);
    }

    @Transactional
    public void createSection(ApiDocSectionRequest req) {
        ApiDocSection section = ApiDocSection.builder()
                .categoryId(req.getCategoryId())
                .title(req.getTitle())
                .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
                .isActive(true)
                .build();
        sectionMapper.insert(section);
    }

    @Transactional
    public void updateSection(Long id, ApiDocSectionRequest req) {
        ApiDocSection section = sectionMapper.findById(id)
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

    public List<ApiDocBlock> getBlocksBySectionId(Long sectionId) {
        return blockMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveBlocks(Long sectionId, List<ApiDocBlockDto> blocks, Long userId) {
        // 기존 블록 전체 삭제 후 재삽입 (task 패턴 동일)
        blockMapper.deleteBySectionId(sectionId);
        if (blocks == null || blocks.isEmpty()) {
            return;
        }
        for (int i = 0; i < blocks.size(); i++) {
            ApiDocBlockDto dto = blocks.get(i);
            ApiDocBlock block = new ApiDocBlock();
            block.setSectionId(sectionId);
            block.setBlockType(dto.getBlockType());
            block.setContent(dto.getContent());
            block.setSortOrder(i);
            block.setUpdatedBy(userId);
            blockMapper.insert(block);
        }
    }
}
