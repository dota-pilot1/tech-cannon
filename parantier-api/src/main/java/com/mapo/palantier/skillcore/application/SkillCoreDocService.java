package com.mapo.palantier.skillcore.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.skillcore.domain.SkillCoreBlock;
import com.mapo.palantier.skillcore.domain.SkillCoreCategory;
import com.mapo.palantier.skillcore.domain.SkillCoreSection;
import com.mapo.palantier.skillcore.dto.SkillCoreBlockDto;
import com.mapo.palantier.skillcore.dto.SkillCoreCategoryRequest;
import com.mapo.palantier.skillcore.dto.SkillCoreReorderRequest.ReorderItem;
import com.mapo.palantier.skillcore.dto.SkillCoreSectionRequest;
import com.mapo.palantier.skillcore.infrastructure.SkillCoreBlockMapper;
import com.mapo.palantier.skillcore.infrastructure.SkillCoreCategoryMapper;
import com.mapo.palantier.skillcore.infrastructure.SkillCoreSectionMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SkillCoreDocService {

    private final SkillCoreCategoryMapper categoryMapper;
    private final SkillCoreSectionMapper sectionMapper;
    private final SkillCoreBlockMapper blockMapper;

    public List<SkillCoreCategory> getCategories() { return categoryMapper.findAll(); }

    @Transactional
    public void createCategory(SkillCoreCategoryRequest req) {
        SkillCoreCategory category = SkillCoreCategory.builder()
            .name(req.getName()).icon(req.getIcon()).emoji(req.getEmoji())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true).build();
        categoryMapper.insert(category);
    }

    @Transactional
    public void updateCategory(Long id, SkillCoreCategoryRequest req) {
        SkillCoreCategory existing = categoryMapper.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.SKILLCORE_CATEGORY_NOT_FOUND));
        SkillCoreCategory category = SkillCoreCategory.builder()
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

    public List<SkillCoreSection> getSectionsByCategoryId(Long categoryId) {
        return sectionMapper.findByCategoryId(categoryId);
    }

    @Transactional
    public void createSection(SkillCoreSectionRequest req) {
        SkillCoreSection section = SkillCoreSection.builder()
            .categoryId(req.getCategoryId()).title(req.getTitle())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true).build();
        sectionMapper.insert(section);
    }

    @Transactional
    public void updateSection(Long id, SkillCoreSectionRequest req) {
        SkillCoreSection existing = sectionMapper.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.SKILLCORE_SECTION_NOT_FOUND));
        SkillCoreSection section = SkillCoreSection.builder()
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

    public List<SkillCoreBlock> getBlocksBySectionId(Long sectionId) {
        return blockMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveBlocks(Long sectionId, List<SkillCoreBlockDto> blocks, Long userId) {
        blockMapper.deleteBySectionId(sectionId);
        if (blocks == null || blocks.isEmpty()) return;
        for (int i = 0; i < blocks.size(); i++) {
            SkillCoreBlockDto dto = blocks.get(i);
            SkillCoreBlock block = SkillCoreBlock.builder()
                .sectionId(sectionId).blockType(dto.getBlockType())
                .content(dto.getContent()).sortOrder(i).updatedBy(userId).build();
            blockMapper.insert(block);
        }
    }
}
