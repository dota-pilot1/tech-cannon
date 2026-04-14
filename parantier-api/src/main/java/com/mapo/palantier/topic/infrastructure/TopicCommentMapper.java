package com.mapo.palantier.topic.infrastructure;

import com.mapo.palantier.topic.domain.TopicComment;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface TopicCommentMapper {
    List<TopicComment> findByTopicId(@Param("topicId") Long topicId);
    void insert(TopicComment comment);
    void delete(@Param("id") Long id);
}
