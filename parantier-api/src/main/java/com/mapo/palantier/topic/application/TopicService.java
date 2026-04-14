package com.mapo.palantier.topic.application;

import com.mapo.palantier.topic.domain.Topic;
import com.mapo.palantier.topic.domain.TopicRepository;
import com.mapo.palantier.topic.presentation.dto.TopicRequest;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TopicService {

    private final TopicRepository topicRepository;

    public List<Topic> getTopics(String keyword) {
        return topicRepository.findAll(keyword);
    }

    @Transactional
    public Optional<Topic> getTopic(Long id) {
        topicRepository.incrementViewCount(id);
        return topicRepository.findById(id);
    }

    @Transactional
    public Long createTopic(TopicRequest req, Long authorId) {
        String contentPlain = extractPlainText(req.getContent());
        Topic topic = Topic.builder()
            .title(req.getTitle())
            .content(req.getContent())
            .contentPlain(contentPlain)
            .authorId(authorId)
            .build();
        topicRepository.insert(topic);
        return topic.getId();
    }

    @Transactional
    public void updateTopic(Long id, TopicRequest req) {
        String contentPlain = extractPlainText(req.getContent());
        Topic topic = Topic.builder()
            .id(id)
            .title(req.getTitle())
            .content(req.getContent())
            .contentPlain(contentPlain)
            .build();
        topicRepository.update(topic);
    }

    @Transactional
    public void deleteTopic(Long id) {
        topicRepository.delete(id);
    }

    @Transactional
    public void togglePin(Long id) {
        topicRepository.findById(id).ifPresent(topic -> {
            topicRepository.updatePinned(id, !Boolean.TRUE.equals(topic.getIsPinned()));
        });
    }

    private String extractPlainText(String lexicalJson) {
        if (lexicalJson == null || lexicalJson.isBlank()) return "";
        try {
            return lexicalJson.replaceAll("\"text\":\"([^\"]*?)\"", "$1")
                .replaceAll("\\{[^}]*\\}", " ")
                .replaceAll("\\[|\\]|\"", " ")
                .replaceAll("\\s+", " ")
                .trim();
        } catch (Exception e) {
            return lexicalJson;
        }
    }
}
