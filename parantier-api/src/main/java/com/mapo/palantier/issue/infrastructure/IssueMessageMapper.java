package com.mapo.palantier.issue.infrastructure;

import com.mapo.palantier.issue.domain.IssueMessage;
import com.mapo.palantier.issue.domain.MessageWithUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface IssueMessageMapper {

    /**
     * 특정 이슈의 메시지 목록 조회 (작성자 정보 포함)
     */
    List<MessageWithUser> findByIssueId(@Param("issueId") Long issueId);

    /**
     * 메시지 ID로 단일 메시지 조회
     */
    IssueMessage findById(@Param("id") Long id);

    /**
     * 메시지 생성
     */
    void insert(IssueMessage message);

    /**
     * 메시지 수정
     */
    void update(IssueMessage message);

    /**
     * 메시지 삭제 (소프트 삭제)
     */
    void delete(@Param("id") Long id);

    /**
     * 특정 이슈의 전체 메시지 개수 조회
     */
    int countByIssueId(@Param("issueId") Long issueId);
}
