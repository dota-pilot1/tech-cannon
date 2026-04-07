package com.mapo.palantier.hackathon.application;

import com.mapo.palantier.hackathon.domain.HackathonDocBlock;
import com.mapo.palantier.hackathon.domain.HackathonDocCategory;
import com.mapo.palantier.hackathon.domain.HackathonDocSection;
import com.mapo.palantier.hackathon.dto.HackathonDocBlockDto;
import com.mapo.palantier.hackathon.dto.HackathonDocReorderRequest.ReorderItem;
import com.mapo.palantier.hackathon.infrastructure.HackathonDocBlockMapper;
import com.mapo.palantier.hackathon.infrastructure.HackathonDocCategoryMapper;
import com.mapo.palantier.hackathon.infrastructure.HackathonDocSectionMapper;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class HackathonDocService {

    private final HackathonDocCategoryMapper categoryMapper;
    private final HackathonDocSectionMapper sectionMapper;
    private final HackathonDocBlockMapper blockMapper;

    // ──────────────────────────────────────────
    // Category
    // ──────────────────────────────────────────

    public List<HackathonDocCategory> getCategories(Long teamId) {
        return categoryMapper.findByTeamId(teamId);
    }

    @Transactional
    public Long createCategory(Long teamId, String name) {
        int count = categoryMapper.countByTeamId(teamId);
        HackathonDocCategory category = HackathonDocCategory.builder()
            .teamId(teamId)
            .name(name)
            .orderNum(count)
            .build();
        categoryMapper.insert(category);
        return category.getId();
    }

    @Transactional
    public void updateCategory(Long id, String name) {
        categoryMapper.update(id, name);
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

    public List<HackathonDocSection> getSections(Long categoryId) {
        return sectionMapper.findByCategoryId(categoryId);
    }

    @Transactional
    public Long createSection(Long categoryId, Long teamId, String title) {
        int count = sectionMapper.countByCategoryId(categoryId);
        HackathonDocSection section = HackathonDocSection.builder()
            .categoryId(categoryId)
            .teamId(teamId)
            .title(title)
            .orderNum(count)
            .build();
        sectionMapper.insert(section);
        return section.getId();
    }

    @Transactional
    public void updateSection(Long id, String title) {
        sectionMapper.update(id, title);
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

    public List<HackathonDocBlock> getBlocks(Long sectionId) {
        return blockMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveBlocks(
        Long sectionId,
        List<HackathonDocBlockDto> blockDtos
    ) {
        blockMapper.deleteAllBySectionId(sectionId);
        if (blockDtos == null || blockDtos.isEmpty()) {
            return;
        }
        List<HackathonDocBlock> blocks = new ArrayList<>();
        for (int i = 0; i < blockDtos.size(); i++) {
            HackathonDocBlockDto dto = blockDtos.get(i);
            HackathonDocBlock block = HackathonDocBlock.builder()
                .sectionId(sectionId)
                .blockType(
                    dto.getBlockType() != null ? dto.getBlockType() : "NOTE"
                )
                .title(dto.getTitle() != null ? dto.getTitle() : "")
                .content(dto.getContent() != null ? dto.getContent() : "")
                .sortOrder(i)
                .build();
            blocks.add(block);
        }
        blockMapper.insertBatch(blocks);
    }
}
