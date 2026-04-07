package com.mapo.palantier.study.domain;

import java.util.List;

public interface StudyCategoryRepository {
    List<StudyCategory> findAllFlat(Long ownerId);
    void insert(StudyCategory category);
    void update(StudyCategory category);
    void delete(Long id);
}
