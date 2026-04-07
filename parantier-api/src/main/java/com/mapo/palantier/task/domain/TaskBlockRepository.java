package com.mapo.palantier.task.domain;

import java.util.List;

public interface TaskBlockRepository {
    List<TaskBlock> findByPostId(Long postId);
    void insert(TaskBlock block);
    void deleteByPostId(Long postId);
}
