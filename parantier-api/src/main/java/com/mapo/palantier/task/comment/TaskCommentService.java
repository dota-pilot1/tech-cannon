package com.mapo.palantier.task.comment;

import com.mapo.palantier.task.dto.TaskCommentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskCommentService {
    private final TaskCommentMapper taskCommentMapper;

    public List<TaskComment> getCommentsByPostId(Long postId) {
        return taskCommentMapper.findByPostId(postId);
    }

    @Transactional
    public Long createComment(TaskCommentDto dto, Long currentUserId) {
        TaskComment comment = new TaskComment();
        comment.setPostId(dto.getPostId());
        comment.setAuthorId(currentUserId);
        comment.setContent(dto.getContent());

        taskCommentMapper.insert(comment);
        return comment.getId();
    }

    @Transactional
    public void deleteComment(Long id) {
        taskCommentMapper.softDelete(id);
    }
}
