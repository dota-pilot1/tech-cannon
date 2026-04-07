package com.mapo.palantier.task.infrastructure;

import com.mapo.palantier.task.domain.TaskFolder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface TaskFolderMapper {
    List<TaskFolder> findAll();
    Optional<TaskFolder> findById(@Param("id") Long id);
    void insert(TaskFolder folder);
    void update(TaskFolder folder);
    void softDelete(@Param("id") Long id);
}
