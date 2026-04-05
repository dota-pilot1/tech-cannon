package com.mapo.palantier.devlog;

import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DevLogMapper {
    List<DevLog> findByUserId(@Param("userId") Long userId);

    Optional<DevLog> findById(@Param("id") Long id);

    void insert(DevLog devLog);

    void update(DevLog devLog);

    void softDelete(@Param("id") Long id);

    // 이슈 연결
    void linkIssue(
        @Param("devlogId") Long devlogId,
        @Param("issueId") Long issueId
    );
    void unlinkIssue(
        @Param("devlogId") Long devlogId,
        @Param("issueId") Long issueId
    );
    List<Long> findLinkedIssueIds(@Param("devlogId") Long devlogId);

    // 업무 연결
    void linkWork(
        @Param("devlogId") Long devlogId,
        @Param("workId") Long workId
    );
    void unlinkWork(
        @Param("devlogId") Long devlogId,
        @Param("workId") Long workId
    );
    List<Long> findLinkedWorkIds(@Param("devlogId") Long devlogId);
}
