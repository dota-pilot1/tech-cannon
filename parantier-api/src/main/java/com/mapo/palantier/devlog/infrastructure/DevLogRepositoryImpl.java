package com.mapo.palantier.devlog.infrastructure;

import com.mapo.palantier.devlog.domain.DevLog;
import com.mapo.palantier.devlog.domain.DevLogRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class DevLogRepositoryImpl implements DevLogRepository {

    private final DevLogMapper devLogMapper;

    @Override
    public List<DevLog> findByUserId(Long userId) {
        return devLogMapper.findByUserId(userId);
    }

    @Override
    public Optional<DevLog> findById(Long id) {
        return devLogMapper.findById(id);
    }

    @Override
    public void insert(DevLog devLog) {
        devLogMapper.insert(devLog);
    }

    @Override
    public void update(DevLog devLog) {
        devLogMapper.update(devLog);
    }

    @Override
    public void softDelete(Long id) {
        devLogMapper.softDelete(id);
    }

    @Override
    public void linkIssue(Long devlogId, Long issueId) {
        devLogMapper.linkIssue(devlogId, issueId);
    }

    @Override
    public void unlinkIssue(Long devlogId, Long issueId) {
        devLogMapper.unlinkIssue(devlogId, issueId);
    }

    @Override
    public List<Long> findLinkedIssueIds(Long devlogId) {
        return devLogMapper.findLinkedIssueIds(devlogId);
    }

    @Override
    public void linkWork(Long devlogId, Long workId) {
        devLogMapper.linkWork(devlogId, workId);
    }

    @Override
    public void unlinkWork(Long devlogId, Long workId) {
        devLogMapper.unlinkWork(devlogId, workId);
    }

    @Override
    public List<Long> findLinkedWorkIds(Long devlogId) {
        return devLogMapper.findLinkedWorkIds(devlogId);
    }
}
