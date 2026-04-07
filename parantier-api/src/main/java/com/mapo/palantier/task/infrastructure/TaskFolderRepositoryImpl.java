package com.mapo.palantier.task.infrastructure;

import com.mapo.palantier.task.domain.TaskFolder;
import com.mapo.palantier.task.domain.TaskFolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class TaskFolderRepositoryImpl implements TaskFolderRepository {

    private final TaskFolderMapper taskFolderMapper;

    @Override
    public List<TaskFolder> findAll() {
        return taskFolderMapper.findAll();
    }

    @Override
    public Optional<TaskFolder> findById(Long id) {
        return taskFolderMapper.findById(id);
    }

    @Override
    public void insert(TaskFolder folder) {
        taskFolderMapper.insert(folder);
    }

    @Override
    public void update(TaskFolder folder) {
        taskFolderMapper.update(folder);
    }

    @Override
    public void softDelete(Long id) {
        taskFolderMapper.softDelete(id);
    }
}
