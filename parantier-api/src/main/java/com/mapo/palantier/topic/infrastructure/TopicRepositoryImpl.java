package com.mapo.palantier.topic.infrastructure;

import com.mapo.palantier.topic.domain.Topic;
import com.mapo.palantier.topic.domain.TopicRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TopicRepositoryImpl implements TopicRepository {

    private final TopicMapper topicMapper;

    @Override
    public List<Topic> findAll(String keyword) {
        return topicMapper.findAll(keyword);
    }

    @Override
    public Optional<Topic> findById(Long id) {
        return topicMapper.findById(id);
    }

    @Override
    public void insert(Topic topic) {
        topicMapper.insert(topic);
    }

    @Override
    public void update(Topic topic) {
        topicMapper.update(topic);
    }

    @Override
    public void delete(Long id) {
        topicMapper.delete(id);
    }

    @Override
    public void incrementViewCount(Long id) {
        topicMapper.incrementViewCount(id);
    }

    @Override
    public void updatePinned(Long id, Boolean isPinned) {
        topicMapper.updatePinned(id, isPinned);
    }
}
