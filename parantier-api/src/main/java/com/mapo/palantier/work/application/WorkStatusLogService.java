package com.mapo.palantier.work.application;

import com.mapo.palantier.websocket.PureWebSocketHandler;
import com.mapo.palantier.websocket.WsMessage;
import com.mapo.palantier.work.domain.WorkStatusLog;
import com.mapo.palantier.work.infrastructure.WorkStatusLogMapper;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class WorkStatusLogService {

    private final WorkStatusLogMapper logMapper;
    private final PureWebSocketHandler pureWebSocketHandler;

    public WorkStatusLogService(
        WorkStatusLogMapper logMapper,
        @Lazy PureWebSocketHandler pureWebSocketHandler
    ) {
        this.logMapper = logMapper;
        this.pureWebSocketHandler = pureWebSocketHandler;
    }

    @Transactional
    public void log(
        Long workId,
        String workTitle,
        Long changedById,
        String changedByName,
        String changeType,
        String oldValue,
        String newValue
    ) {
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

        // 순수 WebSocket 브로드캐스트
        pureWebSocketHandler.broadcast(
            "work-status",
            new WsMessage("LOG", "work-status", log)
        );
    }

    @Transactional
    public void deleteDoneLogs(Long workId) {
        logMapper.deleteByWorkIdAndNewValue(workId, "DONE");
    }

    public List<WorkStatusLog> getRecentLogs(int limit) {
        return logMapper.findRecent(limit);
    }

    public List<WorkStatusLog> getLogsByWorkId(Long workId) {
        return logMapper.findByWorkId(workId);
    }
}
