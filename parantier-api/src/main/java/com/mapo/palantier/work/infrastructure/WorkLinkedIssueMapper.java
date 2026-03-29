package com.mapo.palantier.work.infrastructure;

import com.mapo.palantier.work.domain.WorkLinkedIssue;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WorkLinkedIssueMapper {

    List<WorkLinkedIssue> findByWorkId(@Param("workId") Long workId);

    void insert(@Param("workId") Long workId, @Param("issueId") Long issueId);

    void delete(@Param("id") Long id);

    boolean existsByWorkIdAndIssueId(@Param("workId") Long workId, @Param("issueId") Long issueId);
}
