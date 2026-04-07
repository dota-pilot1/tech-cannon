package com.mapo.palantier.task.domain;

import java.util.List;
import java.util.Optional;

public interface TaskFolderRepository {
    List<TaskFolder> findAll();
    Optional<TaskFolder> findById(Long id);
    void insert(TaskFolder folder);
    void update(TaskFolder folder);
    void softDelete(Long id);
}
