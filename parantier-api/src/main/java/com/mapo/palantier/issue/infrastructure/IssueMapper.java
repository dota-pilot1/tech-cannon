package com.mapo.palantier.issue.infrastructure;

import com.mapo.palantier.issue.domain.Issue;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface IssueMapper {
    List<Issue> findAll(Map<String, Object> params);

    Issue findById(Long id);

    void insert(Issue issue);

    void update(Issue issue);

    void delete(Long id);

    void updateStatus(@Param("id") Long id, @Param("status") String status);

    void updateAssignee(
        @Param("id") Long id,
        @Param("assigneeId") Long assigneeId
    );

    void updatePriority(
        @Param("id") Long id,
        @Param("priority") String priority
    );

    int count(Map<String, Object> params);

    void updateOrderNum(
        @Param("id") Long id,
        @Param("orderNum") Integer orderNum
    );
}
