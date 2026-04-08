package com.mapo.palantier.devops.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.devops.domain.DevOpsBlock;
import com.mapo.palantier.devops.domain.DevOpsCategory;
import com.mapo.palantier.devops.domain.DevOpsSection;
import com.mapo.palantier.devops.dto.DevOpsBlockDto;
import com.mapo.palantier.devops.dto.DevOpsCategoryRequest;
import com.mapo.palantier.devops.dto.DevOpsReorderRequest.ReorderItem;
import com.mapo.palantier.devops.dto.DevOpsSectionRequest;
import com.mapo.palantier.devops.infrastructure.DevOpsBlockMapper;
import com.mapo.palantier.devops.infrastructure.DevOpsCategoryMapper;
import com.mapo.palantier.devops.infrastructure.DevOpsSectionMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DevOpsDocService {

    private final DevOpsCategoryMapper categoryMapper;
    private final DevOpsSectionMapper sectionMapper;
    private final DevOpsBlockMapper blockMapper;

    public List<DevOpsCategory> getCategories() {
        return categoryMapper.findAll();
    }

    @Transactional
    public void createCategory(DevOpsCategoryRequest req) {
        DevOpsCategory category = DevOpsCategory.builder()
            .name(req.getName()).icon(req.getIcon()).emoji(req.getEmoji())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true).build();
        categoryMapper.insert(category);
    }

    @Transactional
    public void updateCategory(Long id, DevOpsCategoryRequest req) {
        DevOpsCategory existing = categoryMapper.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.DEVOPS_CATEGORY_NOT_FOUND));
        DevOpsCategory category = DevOpsCategory.builder()
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

    public List<DevOpsSection> getSectionsByCategoryId(Long categoryId) {
        return sectionMapper.findByCategoryId(categoryId);
    }

    @Transactional
    public void createSection(DevOpsSectionRequest req) {
        DevOpsSection section = DevOpsSection.builder()
            .categoryId(req.getCategoryId()).title(req.getTitle())
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true).build();
        sectionMapper.insert(section);
    }

    @Transactional
    public void updateSection(Long id, DevOpsSectionRequest req) {
        DevOpsSection existing = sectionMapper.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.DEVOPS_SECTION_NOT_FOUND));
        DevOpsSection section = DevOpsSection.builder()
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

    public List<DevOpsBlock> getBlocksBySectionId(Long sectionId) {
        return blockMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveBlocks(Long sectionId, List<DevOpsBlockDto> blocks, Long userId) {
        blockMapper.deleteBySectionId(sectionId);
        if (blocks == null || blocks.isEmpty()) return;
        for (int i = 0; i < blocks.size(); i++) {
            DevOpsBlockDto dto = blocks.get(i);
            DevOpsBlock block = DevOpsBlock.builder()
                .sectionId(sectionId).blockType(dto.getBlockType())
                .content(dto.getContent()).sortOrder(i).updatedBy(userId).build();
            blockMapper.insert(block);
        }
    }
}
