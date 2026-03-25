package com.palantier.domain.task.comment;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TaskCommentMapper {
    List<TaskComment> findByPostId(@Param("postId") Long postId);

    void insert(TaskComment comment);
    void softDelete(@Param("id") Long id);
}
