package com.mapo.palantier.task.domain;

import com.mapo.palantier.task.presentation.dto.TaskPostDetail;
import com.mapo.palantier.task.presentation.dto.TaskPostSummary;
import java.util.List;
import java.util.Optional;

public interface TaskPostRepository {
    List<TaskPostSummary> findAll();
    List<TaskPostSummary> findByFolderId(Long folderId);
    Optional<TaskPostSummary> findById(Long id);
    Optional<TaskPostDetail> findByIdWithBlocks(Long id);
    void insert(TaskPost post);
    void update(TaskPost post);
    void softDelete(Long id);
}
