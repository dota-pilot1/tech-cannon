package com.mapo.palantier.task.infrastructure;

import com.mapo.palantier.task.domain.TaskComment;
import com.mapo.palantier.task.domain.TaskCommentRepository;
import com.mapo.palantier.task.presentation.dto.TaskCommentResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TaskCommentRepositoryImpl implements TaskCommentRepository {

    private final TaskCommentMapper taskCommentMapper;

    @Override
    public List<TaskCommentResponse> findByPostId(Long postId) {
        return taskCommentMapper.findByPostId(postId);
    }

    @Override
    public void insert(TaskComment comment) {
        taskCommentMapper.insert(comment);
    }

    @Override
    public void softDelete(Long id) {
        taskCommentMapper.softDelete(id);
    }
}
