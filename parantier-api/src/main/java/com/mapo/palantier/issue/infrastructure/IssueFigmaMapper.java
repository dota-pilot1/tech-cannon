package com.mapo.palantier.issue.infrastructure;

import com.mapo.palantier.issue.domain.IssueFigma;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface IssueFigmaMapper {
    List<IssueFigma> findByIssueId(@Param("issueId") Long issueId);
    void insert(IssueFigma figma);
    void update(IssueFigma figma);
    void delete(@Param("id") Long id);
    void deleteByIssueId(@Param("issueId") Long issueId);
}
