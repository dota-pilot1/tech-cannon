package com.mapo.palantier.task.infrastructure;

import com.mapo.palantier.task.domain.TaskBlock;
import com.mapo.palantier.task.domain.TaskBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class TaskBlockRepositoryImpl implements TaskBlockRepository {

    private final TaskBlockMapper taskBlockMapper;

    @Override
    public List<TaskBlock> findByPostId(Long postId) {
        return taskBlockMapper.findByPostId(postId);
    }

    @Override
    public void insert(TaskBlock block) {
        taskBlockMapper.insert(block);
    }

    @Override
    public void deleteByPostId(Long postId) {
        taskBlockMapper.deleteByPostId(postId);
    }
}
