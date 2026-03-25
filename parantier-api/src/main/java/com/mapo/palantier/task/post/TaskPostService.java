package com.mapo.palantier.task.post;

import com.mapo.palantier.task.block.TaskBlock;
import com.mapo.palantier.task.block.TaskBlockMapper;
import com.mapo.palantier.task.dto.TaskBlockDto;
import com.mapo.palantier.task.dto.TaskPostDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskPostService {
    private final TaskPostMapper taskPostMapper;
    private final TaskBlockMapper taskBlockMapper;

    public List<TaskPost> getPostsByFolderId(Long folderId) {
        return taskPostMapper.findByFolderId(folderId);
    }

    public TaskPost getPostById(Long id) {
        return taskPostMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id));
    }

    public TaskPost getPostWithBlocks(Long id) {
        return taskPostMapper.findByIdWithBlocks(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id));
    }

    @Transactional
    public Long savePost(TaskPostDto dto, Long currentUserId) {
        TaskPost post = new TaskPost();
        post.setFolderId(dto.getFolderId());
        post.setTitle(dto.getTitle());
        post.setAuthorId(currentUserId);

        if (dto.getId() == null) {
            // 신규 생성
            taskPostMapper.insert(post);
        } else {
            // 수정
            post.setId(dto.getId());
            taskPostMapper.update(post);
            // 기존 블록 삭제
            taskBlockMapper.deleteByPostId(post.getId());
        }

        // 블록 저장
        if (dto.getBlocks() != null && !dto.getBlocks().isEmpty()) {
            for (int i = 0; i < dto.getBlocks().size(); i++) {
                TaskBlockDto blockDto = dto.getBlocks().get(i);
                TaskBlock block = new TaskBlock();
                block.setPostId(post.getId());
                block.setBlockType(blockDto.getBlockType());
                block.setContent(blockDto.getContent());
                block.setSortOrder(i);
                taskBlockMapper.insert(block);
            }
        }

        return post.getId();
    }

    @Transactional
    public void deletePost(Long id) {
        taskPostMapper.softDelete(id);
    }
}
