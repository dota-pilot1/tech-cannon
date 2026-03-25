package com.mapo.palantier.task.post;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface TaskPostMapper {
    List<TaskPost> findByFolderId(@Param("folderId") Long folderId);
    Optional<TaskPost> findById(@Param("id") Long id);
    Optional<TaskPost> findByIdWithBlocks(@Param("id") Long id);

    void insert(TaskPost post);
    void update(TaskPost post);
    void softDelete(@Param("id") Long id);
}
