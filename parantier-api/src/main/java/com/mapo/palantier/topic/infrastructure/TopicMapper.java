package com.mapo.palantier.topic.infrastructure;

import com.mapo.palantier.topic.domain.Topic;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface TopicMapper {
    List<Topic> findAll(@Param("keyword") String keyword);
    Optional<Topic> findById(@Param("id") Long id);
    void insert(Topic topic);
    void update(Topic topic);
    void delete(@Param("id") Long id);
    void incrementViewCount(@Param("id") Long id);
    void updatePinned(@Param("id") Long id, @Param("isPinned") Boolean isPinned);
}
