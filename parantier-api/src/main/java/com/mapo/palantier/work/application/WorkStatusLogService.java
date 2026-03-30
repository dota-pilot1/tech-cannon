package com.mapo.palantier.work.application;

import com.mapo.palantier.work.domain.WorkStatusLog;
import com.mapo.palantier.work.infrastructure.WorkStatusLogMapper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class WorkStatusLogService {

    private final WorkStatusLogMapper logMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public WorkStatusLogService(WorkStatusLogMapper logMapper, SimpMessagingTemplate messagingTemplate) {
        this.logMapper = logMapper;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public void log(Long workId, String workTitle, Long changedById, String changedByName,
                    String changeType, String oldValue, String newValue) {
        WorkStatusLog log = new WorkStatusLog();
        log.setWorkId(workId);
        log.setWorkTitle(workTitle);
        log.setChangedById(changedById);
        log.setChangedBy(changedByName);
        log.setChangeType(changeType);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setChangedAt(LocalDateTime.now());

        logMapper.insert(log);

        // WebSocket 브로드캐스트
        messagingTemplate.convertAndSend("/topic/work-status", log);
    }

    public List<WorkStatusLog> getRecentLogs(int limit) {
        return logMapper.findRecent(limit);
    }

    public List<WorkStatusLog> getLogsByWorkId(Long workId) {
        return logMapper.findByWorkId(workId);
    }
}
