package com.mapo.palantier.task.infrastructure;

import com.mapo.palantier.task.domain.TaskComment;
import com.mapo.palantier.task.presentation.dto.TaskCommentResponse;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface TaskCommentMapper {
    List<TaskCommentResponse> findByPostId(@Param("postId") Long postId);
    void insert(TaskComment comment);
    void softDelete(@Param("id") Long id);
}
