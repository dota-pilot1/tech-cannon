package com.mapo.palantier.study.application;

import com.mapo.palantier.study.domain.StudyLikeRepository;
import com.mapo.palantier.study.presentation.dto.StudyLikeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudyLikeService {

    private final StudyLikeRepository studyLikeRepository;

    @Transactional
    public StudyLikeResponse toggleLike(Long postId, Long userId) {
        boolean exists = studyLikeRepository.existsByPostAndUser(postId, userId);
        if (exists) {
            studyLikeRepository.delete(postId, userId);
        } else {
            studyLikeRepository.insert(postId, userId);
        }
        long count = studyLikeRepository.countByPost(postId);
        return new StudyLikeResponse(!exists, count);
    }
}
