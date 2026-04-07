package com.mapo.palantier.hackathon.apidoc.application;

import com.mapo.palantier.apidoc.domain.ApiDocBlock;
import com.mapo.palantier.apidoc.domain.ApiDocCategory;
import com.mapo.palantier.apidoc.domain.ApiDocSection;
import com.mapo.palantier.apidoc.dto.ApiDocBlockDto;
import com.mapo.palantier.apidoc.dto.ApiDocCategoryRequest;
import com.mapo.palantier.apidoc.dto.ApiDocReorderRequest;
import com.mapo.palantier.apidoc.dto.ApiDocSectionRequest;
import com.mapo.palantier.apidoc.infrastructure.ApiDocBlockMapper;
import com.mapo.palantier.apidoc.infrastructure.ApiDocSectionMapper;
import com.mapo.palantier.hackathon.apidoc.infrastructure.HackathonApiDocCategoryMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HackathonApiDocService {

    private final HackathonApiDocCategoryMapper categoryMapper;
    private final ApiDocSectionMapper sectionMapper;
    private final ApiDocBlockMapper blockMapper;

    // ── Category (팀별) ──

    public List<ApiDocCategory> getCategoriesByTeam(Long teamId) {
        return categoryMapper.findByTeamId(teamId);
    }

    @Transactional
    public void createCategory(Long teamId, ApiDocCategoryRequest req) {
        ApiDocCategory category = ApiDocCategory.builder()
            .name(req.getName())
            .icon(req.getIcon() != null ? req.getIcon() : "Folder")
            .emoji(req.getEmoji() != null ? req.getEmoji() : "📁")
            .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
            .isActive(true)
            .build();
        categoryMapper.insertForTeam(category, teamId);
    }

    @Transactional
    public void updateCategory(Long id, ApiDocCategoryRequest req) {
        ApiDocCategory existing = categoryMapper
            .findByIdForTeam(id)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "카테고리를 찾을 수 없습니다: " + id
                )
            );
        ApiDocCategory category = ApiDocCategory.builder()
            .id(existing.getId())
            .name(req.getName())
            .icon(req.getIcon() != null ? req.getIcon() : existing.getIcon())
            .emoji(
                req.getEmoji() != null ? req.getEmoji() : existing.getEmoji()
            )
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
    public void reorderCategories(
        Long teamId,
        List<ApiDocReorderRequest.ReorderItem> items
    ) {
        for (ApiDocReorderRequest.ReorderItem item : items) {
            categoryMapper.updateOrderNum(item.getId(), item.getOrderNum());
        }
    }

    // ── Section (기존 ApiDocSectionMapper 재사용) ──

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
        ApiDocSection existing = sectionMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException("섹션을 찾을 수 없습니다: " + id)
            );
        ApiDocSection section = ApiDocSection.builder()
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
    public void reorderSections(List<ApiDocReorderRequest.ReorderItem> items) {
        for (ApiDocReorderRequest.ReorderItem item : items) {
            sectionMapper.updateOrderNum(item.getId(), item.getOrderNum());
        }
    }

    // ── Block (기존 ApiDocBlockMapper 재사용) ──

    public List<ApiDocBlock> getBlocksBySectionId(Long sectionId) {
        return blockMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveBlocks(
        Long sectionId,
        List<ApiDocBlockDto> blocks,
        Long userId
    ) {
        blockMapper.deleteBySectionId(sectionId);
        if (blocks == null || blocks.isEmpty()) return;
        for (int i = 0; i < blocks.size(); i++) {
            ApiDocBlockDto dto = blocks.get(i);
            ApiDocBlock block = ApiDocBlock.builder()
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
