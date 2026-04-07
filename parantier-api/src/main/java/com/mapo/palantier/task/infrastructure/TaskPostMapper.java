package com.mapo.palantier.task.infrastructure;

import com.mapo.palantier.task.domain.TaskPost;
import com.mapo.palantier.task.presentation.dto.TaskPostDetail;
import com.mapo.palantier.task.presentation.dto.TaskPostSummary;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface TaskPostMapper {
    List<TaskPostSummary> findAll();
    List<TaskPostSummary> findByFolderId(@Param("folderId") Long folderId);
    Optional<TaskPostSummary> findById(@Param("id") Long id);
    Optional<TaskPostDetail> findByIdWithBlocks(@Param("id") Long id);

    void insert(TaskPost post);
    void update(TaskPost post);
    void softDelete(@Param("id") Long id);
}
