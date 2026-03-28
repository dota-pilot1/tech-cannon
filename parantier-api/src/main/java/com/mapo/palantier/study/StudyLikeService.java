package com.mapo.palantier.study;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudyLikeService {

    private final StudyLikeMapper studyLikeMapper;

    @Transactional
    public StudyLikeResponse toggleLike(Long postId, Long userId) {
        boolean exists = studyLikeMapper.existsByPostAndUser(postId, userId);
        if (exists) {
            studyLikeMapper.delete(postId, userId);
        } else {
            studyLikeMapper.insert(postId, userId);
        }
        long count = studyLikeMapper.countByPost(postId);
        return new StudyLikeResponse(!exists, count);
    }
}
