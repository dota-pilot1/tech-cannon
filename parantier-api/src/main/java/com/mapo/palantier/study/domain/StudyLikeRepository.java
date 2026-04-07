package com.mapo.palantier.study.domain;

public interface StudyLikeRepository {
    boolean existsByPostAndUser(Long postId, Long userId);
    void insert(Long postId, Long userId);
    void delete(Long postId, Long userId);
    long countByPost(Long postId);
}
