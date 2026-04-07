package com.mapo.palantier.study.domain;

import java.util.List;
import java.util.Optional;

public interface StudyPostRepository {
    List<StudyPost> findByCategory(Long categoryId, Long currentUserId, String keyword, Boolean isPublic);
    Optional<StudyPost> findById(Long id, Long currentUserId);
    void insert(StudyPost post);
    void update(StudyPost post);
    void delete(Long id);
    void incrementViewCount(Long id);
    void updatePinned(Long id, Boolean isPinned);
}
