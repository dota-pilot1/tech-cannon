package com.mapo.palantier.springai.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.springai.domain.SpringAiBlock;
import com.mapo.palantier.springai.domain.SpringAiCategory;
import com.mapo.palantier.springai.domain.SpringAiSection;
import com.mapo.palantier.springai.dto.SpringAiBlockDto;
import com.mapo.palantier.springai.dto.SpringAiCategoryRequest;
import com.mapo.palantier.springai.dto.SpringAiReorderRequest.ReorderItem;
import com.mapo.palantier.springai.dto.SpringAiSectionRequest;
import com.mapo.palantier.springai.infrastructure.SpringAiBlockMapper;
import com.mapo.palantier.springai.infrastructure.SpringAiCategoryMapper;
import com.mapo.palantier.springai.infrastructure.SpringAiSectionMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpringAiDocService {

    private final SpringAiCategoryMapper categoryMapper;
    private final SpringAiSectionMapper sectionMapper;
    private final SpringAiBlockMapper blockMapper;

    public List<SpringAiCategory> getCategories() { return categoryMapper.findAll(); }

    @Transactional
    public void createCategory(SpringAiCategoryRequest req) {
        SpringAiCategory category = SpringAiCategory.builder()
            .name(req.getName()).icon(req.getIcon()).emoji(req.getEmoji())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true).build();
        categoryMapper.insert(category);
    }

    @Transactional
    public void updateCategory(Long id, SpringAiCategoryRequest req) {
        SpringAiCategory existing = categoryMapper.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.SPRINGAI_CATEGORY_NOT_FOUND));
        SpringAiCategory category = SpringAiCategory.builder()
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

    public List<SpringAiSection> getSectionsByCategoryId(Long categoryId) {
        return sectionMapper.findByCategoryId(categoryId);
    }

    @Transactional
    public void createSection(SpringAiSectionRequest req) {
        SpringAiSection section = SpringAiSection.builder()
            .categoryId(req.getCategoryId()).title(req.getTitle())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true).build();
        sectionMapper.insert(section);
    }

    @Transactional
    public void updateSection(Long id, SpringAiSectionRequest req) {
        SpringAiSection existing = sectionMapper.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.SPRINGAI_SECTION_NOT_FOUND));
        SpringAiSection section = SpringAiSection.builder()
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

    public List<SpringAiBlock> getBlocksBySectionId(Long sectionId) {
        return blockMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveBlocks(Long sectionId, List<SpringAiBlockDto> blocks, Long userId) {
        blockMapper.deleteBySectionId(sectionId);
        if (blocks == null || blocks.isEmpty()) return;
        for (int i = 0; i < blocks.size(); i++) {
            SpringAiBlockDto dto = blocks.get(i);
            SpringAiBlock block = SpringAiBlock.builder()
                .sectionId(sectionId).blockType(dto.getBlockType())
                .content(dto.getContent()).sortOrder(i).updatedBy(userId).build();
            blockMapper.insert(block);
        }
    }
}
