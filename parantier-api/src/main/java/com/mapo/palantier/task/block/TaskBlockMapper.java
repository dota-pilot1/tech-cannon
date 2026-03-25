package com.mapo.palantier.task.block;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TaskBlockMapper {
    List<TaskBlock> findByPostId(@Param("postId") Long postId);

    void insert(TaskBlock block);
    void deleteByPostId(@Param("postId") Long postId);
}
