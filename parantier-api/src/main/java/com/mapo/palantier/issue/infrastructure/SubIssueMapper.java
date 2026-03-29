package com.mapo.palantier.issue.infrastructure;

import com.mapo.palantier.issue.domain.SubIssue;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SubIssueMapper {
    List<SubIssue> findByParentIssueId(@Param("parentIssueId") Long parentIssueId);
    SubIssue findById(@Param("id") Long id);
    void insert(SubIssue subIssue);
    void update(SubIssue subIssue);
    void delete(@Param("id") Long id);
    void toggleResolved(@Param("id") Long id);
}
