package com.mapo.palantier.figma.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.figma.domain.FigmaCategory;
import com.mapo.palantier.figma.domain.FigmaLink;
import com.mapo.palantier.figma.dto.FigmaCategoryRequest;
import com.mapo.palantier.figma.dto.FigmaLinkRequest;
import com.mapo.palantier.figma.dto.FigmaReorderRequest.ReorderItem;
import com.mapo.palantier.figma.infrastructure.FigmaCategoryMapper;
import com.mapo.palantier.figma.infrastructure.FigmaLinkMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FigmaService {

    private final FigmaCategoryMapper categoryMapper;
    private final FigmaLinkMapper linkMapper;

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
        FigmaCategory existing = categoryMapper
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    ErrorCode.FIGMA_CATEGORY_NOT_FOUND
                )
            );
        FigmaCategory updated = FigmaCategory.builder()
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
        categoryMapper.update(updated);
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
        FigmaLink existing = linkMapper
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.FIGMA_LINK_NOT_FOUND)
            );
        FigmaLink updated = FigmaLink.builder()
            .id(existing.getId())
            .categoryId(
                req.getCategoryId() != null
                    ? req.getCategoryId()
                    : existing.getCategoryId()
            )
            .title(req.getTitle())
            .url(req.getUrl())
            .orderNum(
                req.getOrderNum() != null
                    ? req.getOrderNum()
                    : existing.getOrderNum()
            )
            .createdAt(existing.getCreatedAt())
            .build();
        linkMapper.update(updated);
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
