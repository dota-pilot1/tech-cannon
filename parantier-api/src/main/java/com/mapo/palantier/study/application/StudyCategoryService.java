package com.mapo.palantier.study.application;

import com.mapo.palantier.study.domain.StudyCategory;
import com.mapo.palantier.study.domain.StudyCategoryRepository;
import com.mapo.palantier.study.presentation.dto.StudyCategoryRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyCategoryService {

    private final StudyCategoryRepository studyCategoryRepository;

    public List<StudyCategory> getCategoryTree(Long ownerId) {
        List<StudyCategory> flat = studyCategoryRepository.findAllFlat(ownerId);
        return buildTree(flat);
    }

    @Transactional
    public Long createCategory(StudyCategoryRequest req, Long authorId) {
        StudyCategory category = StudyCategory.builder()
            .name(req.getName())
            .parentId(req.getParentId())
            .icon(req.getIcon())
            .description(req.getDescription())
            .orderNum(req.getOrderNum())
            .authorId(authorId)
            .build();
        studyCategoryRepository.insert(category);
        return category.getId();
    }

    @Transactional
    public void updateCategory(Long id, StudyCategoryRequest req) {
        StudyCategory category = StudyCategory.builder()
            .id(id)
            .name(req.getName())
            .parentId(req.getParentId())
            .icon(req.getIcon())
            .description(req.getDescription())
            .orderNum(req.getOrderNum())
            .build();
        studyCategoryRepository.update(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        studyCategoryRepository.delete(id);
    }

    private List<StudyCategory> buildTree(List<StudyCategory> flat) {
        Map<Long, StudyCategory> map = new LinkedHashMap<>();
        List<StudyCategory> roots = new ArrayList<>();

        for (StudyCategory cat : flat) {
            StudyCategory withChildren = StudyCategory.builder()
                .id(cat.getId())
                .name(cat.getName())
                .parentId(cat.getParentId())
                .icon(cat.getIcon())
                .description(cat.getDescription())
                .orderNum(cat.getOrderNum())
                .isActive(cat.getIsActive())
                .authorId(cat.getAuthorId())
                .createdAt(cat.getCreatedAt())
                .updatedAt(cat.getUpdatedAt())
                .depth(cat.getDepth())
                .children(new ArrayList<>())
                .build();
            map.put(withChildren.getId(), withChildren);
        }
        for (StudyCategory cat : map.values()) {
            if (cat.getParentId() == null) {
                roots.add(cat);
            } else {
                StudyCategory parent = map.get(cat.getParentId());
                if (parent != null) {
                    parent.getChildren().add(cat);
                }
            }
        }
        return roots;
    }
}
