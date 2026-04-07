package com.mapo.palantier.task.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.task.domain.TaskBlock;
import com.mapo.palantier.task.domain.TaskBlockRepository;
import com.mapo.palantier.task.domain.TaskPost;
import com.mapo.palantier.task.domain.TaskPostRepository;
import com.mapo.palantier.task.presentation.dto.TaskBlockRequest;
import com.mapo.palantier.task.presentation.dto.TaskPostDetail;
import com.mapo.palantier.task.presentation.dto.TaskPostRequest;
import com.mapo.palantier.task.presentation.dto.TaskPostSummary;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskPostService {

    private final TaskPostRepository taskPostRepository;
    private final TaskBlockRepository taskBlockRepository;

    public List<TaskPostSummary> getAllPosts() {
        return taskPostRepository.findAll();
    }

    public List<TaskPostSummary> getPostsByFolderId(Long folderId) {
        return taskPostRepository.findByFolderId(folderId);
    }

    public TaskPostSummary getPostById(Long id) {
        return taskPostRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.TASK_POST_NOT_FOUND)
            );
    }

    public TaskPostDetail getPostWithBlocks(Long id) {
        return taskPostRepository
            .findByIdWithBlocks(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.TASK_POST_NOT_FOUND)
            );
    }

    @Transactional
    public Long savePost(TaskPostRequest request, Long currentUserId) {
        if (request.getId() == null) {
            // 신규 생성 — 도메인 팩토리 메서드 사용
            TaskPost post = TaskPost.create(
                request.getFolderId(),
                request.getTitle(),
                currentUserId
            );
            taskPostRepository.insert(post);
            saveBlocks(post.getId(), request.getBlocks());
            return post.getId();
        } else {
            // 수정 — 도메인 팩토리 메서드 사용
            TaskPost post = TaskPost.modify(
                request.getId(),
                request.getFolderId(),
                request.getTitle(),
                currentUserId
            );
            taskPostRepository.update(post);
            taskBlockRepository.deleteByPostId(post.getId());
            saveBlocks(post.getId(), request.getBlocks());
            return post.getId();
        }
    }

    @Transactional
    public void deletePost(Long id) {
        taskPostRepository.softDelete(id);
    }

    private void saveBlocks(Long postId, List<TaskBlockRequest> blockRequests) {
        if (blockRequests == null || blockRequests.isEmpty()) return;
        for (int i = 0; i < blockRequests.size(); i++) {
            TaskBlockRequest req = blockRequests.get(i);
            TaskBlock block = TaskBlock.builder()
                .postId(postId)
                .blockType(req.getBlockType())
                .content(req.getContent())
                .sortOrder(i)
                .build();
            taskBlockRepository.insert(block);
        }
    }
}
