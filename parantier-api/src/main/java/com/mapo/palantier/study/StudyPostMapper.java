package com.mapo.palantier.study;

import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StudyPostMapper {
    List<StudyPost> findByCategory(
        @Param("categoryId") Long categoryId,
        @Param("currentUserId") Long currentUserId,
        @Param("keyword") String keyword
    );
    Optional<StudyPost> findById(
        @Param("id") Long id,
        @Param("currentUserId") Long currentUserId
    );
    void insert(StudyPost post);
    void update(StudyPost post);
    void delete(@Param("id") Long id);
    void incrementViewCount(@Param("id") Long id);
    void updatePinned(
        @Param("id") Long id,
        @Param("isPinned") Boolean isPinned
    );
}
