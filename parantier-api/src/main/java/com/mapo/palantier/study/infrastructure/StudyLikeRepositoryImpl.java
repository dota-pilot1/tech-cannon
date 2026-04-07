package com.mapo.palantier.study.infrastructure;

import com.mapo.palantier.study.domain.StudyLikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class StudyLikeRepositoryImpl implements StudyLikeRepository {

    private final StudyLikeMapper studyLikeMapper;

    @Override
    public boolean existsByPostAndUser(Long postId, Long userId) {
        return studyLikeMapper.existsByPostAndUser(postId, userId);
    }

    @Override
    public void insert(Long postId, Long userId) {
        studyLikeMapper.insert(postId, userId);
    }

    @Override
    public void delete(Long postId, Long userId) {
        studyLikeMapper.delete(postId, userId);
    }

    @Override
    public long countByPost(Long postId) {
        return studyLikeMapper.countByPost(postId);
    }
}
