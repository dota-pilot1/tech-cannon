package com.mapo.palantier.issue.infrastructure;

import com.mapo.palantier.issue.domain.Issue;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface IssueMapper {

    List<Issue> findAll(Map<String, Object> params);

    Issue findById(Long id);

    void insert(Issue issue);

    void update(Issue issue);

    void delete(Long id);

    void updateStatus(@Param("id") Long id, @Param("status") String status);

    void updateAssignee(@Param("id") Long id, @Param("assigneeId") Long assigneeId);

    int count(Map<String, Object> params);
}
