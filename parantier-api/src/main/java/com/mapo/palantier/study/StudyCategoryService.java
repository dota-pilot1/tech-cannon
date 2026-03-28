package com.mapo.palantier.study;

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

    private final StudyCategoryMapper studyCategoryMapper;

    public List<StudyCategory> getCategoryTree() {
        List<StudyCategory> flat = studyCategoryMapper.findAllFlat();
        return buildTree(flat);
    }

    @Transactional
    public Long createCategory(StudyCategoryRequest req) {
        StudyCategory category = new StudyCategory();
        category.setName(req.getName());
        category.setParentId(req.getParentId());
        category.setIcon(req.getIcon());
        category.setDescription(req.getDescription());
        category.setOrderNum(req.getOrderNum());
        studyCategoryMapper.insert(category);
        return category.getId();
    }

    @Transactional
    public void updateCategory(Long id, StudyCategoryRequest req) {
        StudyCategory category = new StudyCategory();
        category.setId(id);
        category.setName(req.getName());
        category.setParentId(req.getParentId());
        category.setIcon(req.getIcon());
        category.setDescription(req.getDescription());
        category.setOrderNum(req.getOrderNum());
        studyCategoryMapper.update(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        studyCategoryMapper.delete(id);
    }

    private List<StudyCategory> buildTree(List<StudyCategory> flat) {
        Map<Long, StudyCategory> map = new LinkedHashMap<>();
        List<StudyCategory> roots = new ArrayList<>();

        for (StudyCategory cat : flat) {
            cat.setChildren(new ArrayList<>());
            map.put(cat.getId(), cat);
        }
        for (StudyCategory cat : flat) {
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
