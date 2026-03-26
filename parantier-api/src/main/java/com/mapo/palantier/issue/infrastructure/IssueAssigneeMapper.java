package com.mapo.palantier.issue.infrastructure;

import com.mapo.palantier.issue.domain.IssueAssignee;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface IssueAssigneeMapper {

    /**
     * 특정 이슈의 담당자 목록 조회
     */
    List<IssueAssignee> findByIssueId(@Param("issueId") Long issueId);

    /**
     * 담당자 추가
     */
    void insert(@Param("issueId") Long issueId, @Param("userId") Long userId);

    /**
     * 담당자 제거
     */
    void delete(@Param("issueId") Long issueId, @Param("userId") Long userId);

    /**
     * 이슈의 모든 담당자 제거
     */
    void deleteByIssueId(@Param("issueId") Long issueId);

    /**
     * 담당자 일괄 추가
     */
    void insertBatch(@Param("issueId") Long issueId, @Param("userIds") List<Long> userIds);
}
