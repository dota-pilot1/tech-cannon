package com.mapo.palantier.prototypev2.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.prototypev2.domain.PrototypeBlock;
import com.mapo.palantier.prototypev2.domain.PrototypeCategory;
import com.mapo.palantier.prototypev2.domain.PrototypeSection;
import com.mapo.palantier.prototypev2.dto.PrototypeBlockDto;
import com.mapo.palantier.prototypev2.dto.PrototypeCategoryRequest;
import com.mapo.palantier.prototypev2.dto.PrototypeReorderRequest.ReorderItem;
import com.mapo.palantier.prototypev2.dto.PrototypeSectionRequest;
import com.mapo.palantier.prototypev2.infrastructure.PrototypeBlockMapper;
import com.mapo.palantier.prototypev2.infrastructure.PrototypeCategoryMapper;
import com.mapo.palantier.prototypev2.infrastructure.PrototypeSectionMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PrototypeDocService {

    private final PrototypeCategoryMapper categoryMapper;
    private final PrototypeSectionMapper sectionMapper;
    private final PrototypeBlockMapper blockMapper;

    public List<PrototypeCategory> getCategories() { return categoryMapper.findAll(); }

    @Transactional
    public void createCategory(PrototypeCategoryRequest req) {
        PrototypeCategory category = PrototypeCategory.builder()
            .name(req.getName()).icon(req.getIcon()).emoji(req.getEmoji())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true).build();
        categoryMapper.insert(category);
    }

    @Transactional
    public void updateCategory(Long id, PrototypeCategoryRequest req) {
        PrototypeCategory existing = categoryMapper.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROTOTYPE_CATEGORY_NOT_FOUND));
        PrototypeCategory category = PrototypeCategory.builder()
            .id(existing.getId()).name(req.getName()).icon(req.getIcon()).emoji(req.getEmoji())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : existing.getOrderNum())
            .isActive(existing.getIsActive()).createdAt(existing.getCreatedAt()).build();
        categoryMapper.update(category);
    }

    @Transactional
    public void deleteCategory(Long id) { categoryMapper.delete(id); }

    @Transactional
    public void reorderCategories(List<ReorderItem> items) {
        for (ReorderItem item : items) categoryMapper.updateOrderNum(item.getId(), item.getOrderNum());
    }

    public List<PrototypeSection> getSectionsByCategoryId(Long categoryId) {
        return sectionMapper.findByCategoryId(categoryId);
    }

    @Transactional
    public void createSection(PrototypeSectionRequest req) {
        PrototypeSection section = PrototypeSection.builder()
            .categoryId(req.getCategoryId()).title(req.getTitle())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true).build();
        sectionMapper.insert(section);
    }

    @Transactional
    public void updateSection(Long id, PrototypeSectionRequest req) {
        PrototypeSection existing = sectionMapper.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROTOTYPE_SECTION_NOT_FOUND));
        PrototypeSection section = PrototypeSection.builder()
            .id(existing.getId())
            .categoryId(req.getCategoryId() != null ? req.getCategoryId() : existing.getCategoryId())
            .title(req.getTitle())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : existing.getOrderNum())
            .isActive(existing.getIsActive()).createdAt(existing.getCreatedAt()).build();
        sectionMapper.update(section);
    }

    @Transactional
    public void deleteSection(Long id) { sectionMapper.delete(id); }

    @Transactional
    public void reorderSections(List<ReorderItem> items) {
        for (ReorderItem item : items) sectionMapper.updateOrderNum(item.getId(), item.getOrderNum());
    }

    public List<PrototypeBlock> getBlocksBySectionId(Long sectionId) {
        return blockMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveBlocks(Long sectionId, List<PrototypeBlockDto> blocks, Long userId) {
        blockMapper.deleteBySectionId(sectionId);
        if (blocks == null || blocks.isEmpty()) return;
        for (int i = 0; i < blocks.size(); i++) {
            PrototypeBlockDto dto = blocks.get(i);
            PrototypeBlock block = PrototypeBlock.builder()
                .sectionId(sectionId).blockType(dto.getBlockType())
                .content(dto.getContent()).sortOrder(i).updatedBy(userId).build();
            blockMapper.insert(block);
        }
    }
}
