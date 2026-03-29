package com.mapo.palantier.work.infrastructure;

import com.mapo.palantier.work.domain.Work;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface WorkMapper {

    List<Work> findAll(Map<String, Object> params);

    Work findById(Long id);

    void insert(Work work);

    void update(Work work);

    void delete(Long id);

    void updateStatus(@Param("id") Long id, @Param("status") String status);

    void updateAssignee(@Param("id") Long id, @Param("assigneeId") Long assigneeId);

    void updatePriority(@Param("id") Long id, @Param("priority") String priority);

    int count(Map<String, Object> params);

    void updateOrderNum(@Param("id") Long id, @Param("orderNum") Integer orderNum);

    void updateArchivedBatch(@Param("ids") List<Long> ids, @Param("isArchived") Boolean isArchived);
}
