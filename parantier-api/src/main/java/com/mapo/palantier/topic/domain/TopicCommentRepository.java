package com.mapo.palantier.topic.domain;

import java.util.List;

public interface TopicCommentRepository {
    List<TopicComment> findByTopicId(Long topicId);
    void insert(TopicComment comment);
    void delete(Long id);
}
