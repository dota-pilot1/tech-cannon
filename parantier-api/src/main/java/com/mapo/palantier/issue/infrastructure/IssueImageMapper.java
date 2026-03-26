package com.mapo.palantier.issue.infrastructure;

import com.mapo.palantier.issue.domain.IssueImage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface IssueImageMapper {
    void insert(IssueImage image);
    List<IssueImage> findByIssueId(@Param("issueId") Long issueId);
    void deleteById(@Param("id") Long id);
    void deleteByIssueId(@Param("issueId") Long issueId);
}
