package com.mapo.palantier.issue.infrastructure;

import com.mapo.palantier.issue.domain.IssueTaskLink;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface IssueTaskLinkMapper {

    /**
     * 특정 이슈에 연결된 업무 목록 조회 (task_posts 조인)
     */
    List<Map<String, Object>> findTasksByIssueId(@Param("issueId") Long issueId);

    /**
     * 이슈-업무 연결 추가
     */
    void insert(IssueTaskLink link);

    /**
     * 이슈-업무 연결 삭제
     */
    void delete(@Param("id") Long id);

    /**
     * 이슈의 모든 업무 연결 삭제
     */
    void deleteByIssueId(@Param("issueId") Long issueId);
}
