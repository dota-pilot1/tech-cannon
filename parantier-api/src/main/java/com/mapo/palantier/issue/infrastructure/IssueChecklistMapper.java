package com.mapo.palantier.issue.infrastructure;

import com.mapo.palantier.issue.domain.IssueChecklist;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface IssueChecklistMapper {

    /**
     * 특정 이슈의 체크리스트 목록 조회
     */
    List<IssueChecklist> findByIssueId(@Param("issueId") Long issueId);

    /**
     * 체크리스트 항목 추가
     */
    void insert(IssueChecklist checklist);

    /**
     * 체크리스트 항목 수정
     */
    void update(IssueChecklist checklist);

    /**
     * 체크리스트 항목 삭제
     */
    void delete(@Param("id") Long id);

    /**
     * 이슈의 모든 체크리스트 삭제
     */
    void deleteByIssueId(@Param("issueId") Long issueId);

    /**
     * 체크 상태 토글
     */
    void toggleChecked(@Param("id") Long id);
}
