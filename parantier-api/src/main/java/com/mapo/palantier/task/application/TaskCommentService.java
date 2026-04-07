package com.mapo.palantier.task.application;

import com.mapo.palantier.task.domain.TaskComment;
import com.mapo.palantier.task.domain.TaskCommentRepository;
import com.mapo.palantier.task.presentation.dto.TaskCommentRequest;
import com.mapo.palantier.task.presentation.dto.TaskCommentResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskCommentService {

    private final TaskCommentRepository taskCommentRepository;

    public List<TaskCommentResponse> getCommentsByPostId(Long postId) {
        return taskCommentRepository.findByPostId(postId);
    }

    @Transactional
    public Long createComment(TaskCommentRequest request, Long currentUserId) {
        TaskComment comment = TaskComment.create(
            request.getPostId(),
            currentUserId,
            request.getContent()
        );
        taskCommentRepository.insert(comment);
        return comment.getId();
    }

    @Transactional
    public void deleteComment(Long id) {
        taskCommentRepository.softDelete(id);
    }
}
