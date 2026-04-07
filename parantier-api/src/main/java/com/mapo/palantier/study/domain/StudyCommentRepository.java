package com.mapo.palantier.study.domain;

import java.util.List;

public interface StudyCommentRepository {
    List<StudyComment> findByPostId(Long postId);
    void insert(StudyComment comment);
    void delete(Long id);
}
