package com.mapo.palantier.task.domain;

import com.mapo.palantier.task.presentation.dto.TaskCommentResponse;
import java.util.List;

public interface TaskCommentRepository {
    List<TaskCommentResponse> findByPostId(Long postId);
    void insert(TaskComment comment);
    void softDelete(Long id);
}
