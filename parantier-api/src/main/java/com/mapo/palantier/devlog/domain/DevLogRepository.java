package com.mapo.palantier.devlog.domain;

import java.util.List;
import java.util.Optional;

public interface DevLogRepository {
    List<DevLog> findByUserId(Long userId);
    Optional<DevLog> findById(Long id);
    void insert(DevLog devLog);
    void update(DevLog devLog);
    void softDelete(Long id);
    void linkIssue(Long devlogId, Long issueId);
    void unlinkIssue(Long devlogId, Long issueId);
    List<Long> findLinkedIssueIds(Long devlogId);
    void linkWork(Long devlogId, Long workId);
    void unlinkWork(Long devlogId, Long workId);
    List<Long> findLinkedWorkIds(Long devlogId);
}
