package com.mapo.palantier.issue.infrastructure;

import com.mapo.palantier.issue.domain.IssueDbTable;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface IssueDbTableMapper {

    List<IssueDbTable> findByIssueId(@Param("issueId") Long issueId);

    void insert(IssueDbTable dbTable);

    void update(IssueDbTable dbTable);

    void delete(@Param("id") Long id);

    void deleteByIssueId(@Param("issueId") Long issueId);
}
