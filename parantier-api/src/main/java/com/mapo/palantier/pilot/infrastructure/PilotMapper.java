package com.mapo.palantier.pilot.infrastructure;

import com.mapo.palantier.pilot.domain.Pilot;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface PilotMapper {
    List<Pilot> findAll(Map<String, Object> params);
    Pilot findById(@Param("id") Long id);
    void insert(Pilot pilot);
    void update(Pilot pilot);
    void delete(@Param("id") Long id);
    int count(Map<String, Object> params);
    void updateStatus(@Param("id") Long id, @Param("status") String status);
    void updateAssignee(@Param("id") Long id, @Param("assigneeId") Long assigneeId);
    void updatePriority(@Param("id") Long id, @Param("priority") String priority);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") Integer orderNum);
    void updateArchivedBatch(@Param("ids") List<Long> ids, @Param("isArchived") Boolean isArchived);
}
