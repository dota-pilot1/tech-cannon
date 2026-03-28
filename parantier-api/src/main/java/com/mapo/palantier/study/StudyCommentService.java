package com.mapo.palantier.study;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyCommentService {

    private final StudyCommentMapper studyCommentMapper;

    public List<StudyComment> getComments(Long postId) {
        return studyCommentMapper.findByPostId(postId);
    }

    @Transactional
    public Long createComment(
        Long postId,
        StudyCommentRequest req,
        Long authorId
    ) {
        StudyComment comment = new StudyComment();
        comment.setPostId(postId);
        comment.setAuthorId(authorId);
        comment.setContent(req.getContent());
        studyCommentMapper.insert(comment);
        return comment.getId();
    }

    @Transactional
    public void deleteComment(Long id) {
        studyCommentMapper.delete(id);
    }
}
