package com.mapo.palantier.study.infrastructure;

import com.mapo.palantier.study.domain.StudyComment;
import com.mapo.palantier.study.domain.StudyCommentRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class StudyCommentRepositoryImpl implements StudyCommentRepository {

    private final StudyCommentMapper studyCommentMapper;

    @Override
    public List<StudyComment> findByPostId(Long postId) {
        return studyCommentMapper.findByPostId(postId);
    }

    @Override
    public void insert(StudyComment comment) {
        studyCommentMapper.insert(comment);
    }

    @Override
    public void delete(Long id) {
        studyCommentMapper.delete(id);
    }
}
