package com.mapo.palantier.security.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.security.domain.SecurityBlock;
import com.mapo.palantier.security.domain.SecurityCategory;
import com.mapo.palantier.security.domain.SecuritySection;
import com.mapo.palantier.security.dto.SecurityBlockDto;
import com.mapo.palantier.security.dto.SecurityCategoryRequest;
import com.mapo.palantier.security.dto.SecurityReorderRequest.ReorderItem;
import com.mapo.palantier.security.dto.SecuritySectionRequest;
import com.mapo.palantier.security.infrastructure.SecurityBlockMapper;
import com.mapo.palantier.security.infrastructure.SecurityCategoryMapper;
import com.mapo.palantier.security.infrastructure.SecuritySectionMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SecurityDocService {

    private final SecurityCategoryMapper categoryMapper;
    private final SecuritySectionMapper sectionMapper;
    private final SecurityBlockMapper blockMapper;

    // ──────────────────────────────────────────
    // Category
    // ──────────────────────────────────────────

    public List<SecurityCategory> getCategories() {
        return categoryMapper.findAll();
    }

    @Transactional
    public void createCategory(SecurityCategoryRequest req) {
        SecurityCategory category = SecurityCategory.builder()
            .name(req.getName())
            .icon(req.getIcon())
            .emoji(req.getEmoji())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true)
            .build();
        categoryMapper.insert(category);
    }

    @Transactional
    public void updateCategory(Long id, SecurityCategoryRequest req) {
        SecurityCategory existing = categoryMapper
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.SECURITY_CATEGORY_NOT_FOUND)
            );
        SecurityCategory category = SecurityCategory.builder()
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

    public List<SecuritySection> getSectionsByCategoryId(Long categoryId) {
        return sectionMapper.findByCategoryId(categoryId);
    }

    @Transactional
    public void createSection(SecuritySectionRequest req) {
        SecuritySection section = SecuritySection.builder()
            .categoryId(req.getCategoryId())
            .title(req.getTitle())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true)
            .build();
        sectionMapper.insert(section);
    }

    @Transactional
    public void updateSection(Long id, SecuritySectionRequest req) {
        SecuritySection existing = sectionMapper
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.SECURITY_SECTION_NOT_FOUND)
            );
        SecuritySection section = SecuritySection.builder()
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

    public List<SecurityBlock> getBlocksBySectionId(Long sectionId) {
        return blockMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveBlocks(
        Long sectionId,
        List<SecurityBlockDto> blocks,
        Long userId
    ) {
        blockMapper.deleteBySectionId(sectionId);
        if (blocks == null || blocks.isEmpty()) {
            return;
        }
        for (int i = 0; i < blocks.size(); i++) {
            SecurityBlockDto dto = blocks.get(i);
            SecurityBlock block = SecurityBlock.builder()
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
