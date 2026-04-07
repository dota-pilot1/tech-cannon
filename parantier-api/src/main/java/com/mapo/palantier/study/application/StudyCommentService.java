package com.mapo.palantier.study.application;

import com.mapo.palantier.study.domain.StudyComment;
import com.mapo.palantier.study.domain.StudyCommentRepository;
import com.mapo.palantier.study.presentation.dto.StudyCommentRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyCommentService {

    private final StudyCommentRepository studyCommentRepository;

    public List<StudyComment> getComments(Long postId) {
        return studyCommentRepository.findByPostId(postId);
    }

    @Transactional
    public Long createComment(
        Long postId,
        StudyCommentRequest req,
        Long authorId
    ) {
        StudyComment comment = StudyComment.builder()
            .postId(postId)
            .authorId(authorId)
            .content(req.getContent())
            .build();
        studyCommentRepository.insert(comment);
        return comment.getId();
    }

    @Transactional
    public void deleteComment(Long id) {
        studyCommentRepository.delete(id);
    }
}
