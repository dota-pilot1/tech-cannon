package com.mapo.palantier.study.infrastructure;

import com.mapo.palantier.study.domain.StudyComment;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StudyCommentMapper {
    List<StudyComment> findByPostId(@Param("postId") Long postId);
    void insert(StudyComment comment);
    void delete(@Param("id") Long id);
}
