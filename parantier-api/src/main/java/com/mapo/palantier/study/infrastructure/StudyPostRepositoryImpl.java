package com.mapo.palantier.study.infrastructure;

import com.mapo.palantier.study.domain.StudyPost;
import com.mapo.palantier.study.domain.StudyPostRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class StudyPostRepositoryImpl implements StudyPostRepository {

    private final StudyPostMapper studyPostMapper;

    @Override
    public List<StudyPost> findByCategory(Long categoryId, Long currentUserId, String keyword, Boolean isPublic) {
        return studyPostMapper.findByCategory(categoryId, currentUserId, keyword, isPublic);
    }

    @Override
    public Optional<StudyPost> findById(Long id, Long currentUserId) {
        return studyPostMapper.findById(id, currentUserId);
    }

    @Override
    public void insert(StudyPost post) {
        studyPostMapper.insert(post);
    }

    @Override
    public void update(StudyPost post) {
        studyPostMapper.update(post);
    }

    @Override
    public void delete(Long id) {
        studyPostMapper.delete(id);
    }

    @Override
    public void incrementViewCount(Long id) {
        studyPostMapper.incrementViewCount(id);
    }

    @Override
    public void updatePinned(Long id, Boolean isPinned) {
        studyPostMapper.updatePinned(id, isPinned);
    }
}
