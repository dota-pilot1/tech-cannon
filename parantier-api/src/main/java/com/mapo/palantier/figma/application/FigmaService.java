package com.mapo.palantier.figma.application;

import com.mapo.palantier.figma.domain.FigmaCategory;
import com.mapo.palantier.figma.domain.FigmaLink;
import com.mapo.palantier.figma.dto.FigmaCategoryRequest;
import com.mapo.palantier.figma.dto.FigmaLinkRequest;
import com.mapo.palantier.figma.dto.FigmaReorderRequest.ReorderItem;
import com.mapo.palantier.figma.infrastructure.FigmaCategoryMapper;
import com.mapo.palantier.figma.infrastructure.FigmaLinkMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FigmaService {

    private final FigmaCategoryMapper categoryMapper;
    private final FigmaLinkMapper linkMapper;

    // ──────────────────────────────────────────
    // Category
    // ──────────────────────────────────────────

    public List<FigmaCategory> getCategories() {
        return categoryMapper.findAll();
    }

    @Transactional
    public void createCategory(FigmaCategoryRequest req) {
        FigmaCategory category = FigmaCategory.builder()
                .name(req.getName())
                .icon(req.getIcon())
                .emoji(req.getEmoji())
                .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
                .isActive(true)
                .build();
        categoryMapper.insert(category);
    }

    @Transactional
    public void updateCategory(Long id, FigmaCategoryRequest req) {
        FigmaCategory category = categoryMapper.findById(id)
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
    // Link
    // ──────────────────────────────────────────

    public List<FigmaLink> getLinks(Long categoryId) {
        return linkMapper.findByCategoryId(categoryId);
    }

    @Transactional
    public void createLink(FigmaLinkRequest req) {
        FigmaLink link = FigmaLink.builder()
                .categoryId(req.getCategoryId())
                .title(req.getTitle())
                .url(req.getUrl())
                .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
                .build();
        linkMapper.insert(link);
    }

    @Transactional
    public void updateLink(Long id, FigmaLinkRequest req) {
        FigmaLink link = linkMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("링크를 찾을 수 없습니다: " + id));
        link.setTitle(req.getTitle());
        link.setUrl(req.getUrl());
        if (req.getCategoryId() != null) {
            link.setCategoryId(req.getCategoryId());
        }
        if (req.getOrderNum() != null) {
            link.setOrderNum(req.getOrderNum());
        }
        linkMapper.update(link);
    }

    @Transactional
    public void deleteLink(Long id) {
        linkMapper.delete(id);
    }

    @Transactional
    public void reorderLinks(List<ReorderItem> items) {
        for (ReorderItem item : items) {
            linkMapper.updateOrderNum(item.getId(), item.getOrderNum());
        }
    }
}
