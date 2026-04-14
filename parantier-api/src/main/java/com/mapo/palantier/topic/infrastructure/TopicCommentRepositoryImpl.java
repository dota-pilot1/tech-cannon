package com.mapo.palantier.topic.infrastructure;

import com.mapo.palantier.topic.domain.TopicComment;
import com.mapo.palantier.topic.domain.TopicCommentRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TopicCommentRepositoryImpl implements TopicCommentRepository {

    private final TopicCommentMapper topicCommentMapper;

    @Override
    public List<TopicComment> findByTopicId(Long topicId) {
        return topicCommentMapper.findByTopicId(topicId);
    }

    @Override
    public void insert(TopicComment comment) {
        topicCommentMapper.insert(comment);
    }

    @Override
    public void delete(Long id) {
        topicCommentMapper.delete(id);
    }
}
