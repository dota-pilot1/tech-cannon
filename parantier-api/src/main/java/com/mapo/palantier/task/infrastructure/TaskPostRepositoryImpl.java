package com.mapo.palantier.task.infrastructure;

import com.mapo.palantier.task.domain.TaskPost;
import com.mapo.palantier.task.domain.TaskPostRepository;
import com.mapo.palantier.task.presentation.dto.TaskPostDetail;
import com.mapo.palantier.task.presentation.dto.TaskPostSummary;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TaskPostRepositoryImpl implements TaskPostRepository {

    private final TaskPostMapper taskPostMapper;

    @Override
    public List<TaskPostSummary> findAll() {
        return taskPostMapper.findAll();
    }

    @Override
    public List<TaskPostSummary> findByFolderId(Long folderId) {
        return taskPostMapper.findByFolderId(folderId);
    }

    @Override
    public Optional<TaskPostSummary> findById(Long id) {
        return taskPostMapper.findById(id);
    }

    @Override
    public Optional<TaskPostDetail> findByIdWithBlocks(Long id) {
        return taskPostMapper.findByIdWithBlocks(id);
    }

    @Override
    public void insert(TaskPost post) {
        taskPostMapper.insert(post);
    }

    @Override
    public void update(TaskPost post) {
        taskPostMapper.update(post);
    }

    @Override
    public void softDelete(Long id) {
        taskPostMapper.softDelete(id);
    }
}
