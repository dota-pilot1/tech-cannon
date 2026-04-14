package com.mapo.palantier.topic.application;

import com.mapo.palantier.topic.domain.TopicComment;
import com.mapo.palantier.topic.domain.TopicCommentRepository;
import com.mapo.palantier.topic.presentation.dto.TopicCommentRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TopicCommentService {

    private final TopicCommentRepository topicCommentRepository;

    public List<TopicComment> getComments(Long topicId) {
        return topicCommentRepository.findByTopicId(topicId);
    }

    @Transactional
    public Long createComment(Long topicId, TopicCommentRequest req, Long authorId) {
        TopicComment comment = TopicComment.builder()
            .topicId(topicId)
            .authorId(authorId)
            .content(req.getContent())
            .build();
        topicCommentRepository.insert(comment);
        return comment.getId();
    }

    @Transactional
    public void deleteComment(Long id) {
        topicCommentRepository.delete(id);
    }
}
