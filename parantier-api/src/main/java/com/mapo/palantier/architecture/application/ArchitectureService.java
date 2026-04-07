package com.mapo.palantier.architecture.application;

import com.mapo.palantier.architecture.domain.ArchitectureBlock;
import com.mapo.palantier.architecture.domain.ArchitectureCategory;
import com.mapo.palantier.architecture.domain.ArchitectureSection;
import com.mapo.palantier.architecture.dto.BlockDto;
import com.mapo.palantier.architecture.dto.CategoryRequest;
import com.mapo.palantier.architecture.dto.ReorderRequest.ReorderItem;
import com.mapo.palantier.architecture.dto.SectionRequest;
import com.mapo.palantier.architecture.infrastructure.ArchitectureBlockMapper;
import com.mapo.palantier.architecture.infrastructure.ArchitectureCategoryMapper;
import com.mapo.palantier.architecture.infrastructure.ArchitectureSectionMapper;
import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArchitectureService {

    private final ArchitectureCategoryMapper categoryMapper;
    private final ArchitectureSectionMapper sectionMapper;
    private final ArchitectureBlockMapper blockMapper;

    // ──────────────────────────────────────────
    // Category
    // ──────────────────────────────────────────

    public List<ArchitectureCategory> getCategories() {
        return categoryMapper.findAll();
    }

    @Transactional
    public void createCategory(CategoryRequest req) {
        ArchitectureCategory category = ArchitectureCategory.builder()
            .name(req.getName())
            .icon(req.getIcon())
            .emoji(req.getEmoji())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true)
            .build();
        categoryMapper.insert(category);
    }

    @Transactional
    public void updateCategory(Long id, CategoryRequest req) {
        ArchitectureCategory existing = categoryMapper
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    ErrorCode.ARCHITECTURE_CATEGORY_NOT_FOUND
                )
            );
        ArchitectureCategory category = ArchitectureCategory.builder()
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

    public List<ArchitectureSection> getSectionsByCategoryId(Long categoryId) {
        return sectionMapper.findByCategoryId(categoryId);
    }

    @Transactional
    public void createSection(SectionRequest req) {
        ArchitectureSection section = ArchitectureSection.builder()
            .categoryId(req.getCategoryId())
            .title(req.getTitle())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true)
            .build();
        sectionMapper.insert(section);
    }

    @Transactional
    public void updateSection(Long id, SectionRequest req) {
        ArchitectureSection existing = sectionMapper
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    ErrorCode.ARCHITECTURE_SECTION_NOT_FOUND
                )
            );
        ArchitectureSection section = ArchitectureSection.builder()
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

    public List<ArchitectureBlock> getBlocksBySectionId(Long sectionId) {
        return blockMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveBlocks(Long sectionId, List<BlockDto> blocks, Long userId) {
        // 기존 블록 전체 삭제 후 재삽입 (task 패턴 동일)
        blockMapper.deleteBySectionId(sectionId);
        if (blocks == null || blocks.isEmpty()) {
            return;
        }
        for (int i = 0; i < blocks.size(); i++) {
            BlockDto dto = blocks.get(i);
            ArchitectureBlock block = ArchitectureBlock.builder()
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
