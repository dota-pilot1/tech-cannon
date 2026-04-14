package com.mapo.palantier.topic.domain;

import java.util.List;
import java.util.Optional;

public interface TopicRepository {
    List<Topic> findAll(String keyword);
    Optional<Topic> findById(Long id);
    void insert(Topic topic);
    void update(Topic topic);
    void delete(Long id);
    void incrementViewCount(Long id);
    void updatePinned(Long id, Boolean isPinned);
}
