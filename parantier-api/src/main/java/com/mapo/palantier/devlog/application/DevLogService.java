package com.mapo.palantier.devlog.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ForbiddenException;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.devlog.domain.DevLog;
import com.mapo.palantier.devlog.domain.DevLogRepository;
import com.mapo.palantier.devlog.presentation.dto.DevLogRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DevLogService {

    private final DevLogRepository devLogRepository;

    public List<DevLog> getMyDevLogs(Long userId) {
        return devLogRepository.findByUserId(userId);
    }

    @Transactional
    public Long createDevLog(DevLogRequest dto, Long userId) {
        DevLog devLog = DevLog.builder()
            .userId(userId)
            .title(dto.getTitle() != null ? dto.getTitle() : "제목 없음")
            .content(dto.getContent())
            .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
            .logDate(dto.getLogDate())
            .summary(dto.getSummary())
            .build();
        devLogRepository.insert(devLog);
        return devLog.getId();
    }

    @Transactional
    public void updateDevLog(Long id, DevLogRequest dto, Long userId) {
        DevLog devLog = devLogRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.DEVLOG_NOT_FOUND)
            );
        if (!devLog.getUserId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN_UPDATE);
        }
        DevLog updated = DevLog.builder()
            .id(devLog.getId())
            .userId(devLog.getUserId())
            .title(dto.getTitle() != null ? dto.getTitle() : devLog.getTitle())
            .content(dto.getContent())
            .sortOrder(
                dto.getSortOrder() != null
                    ? dto.getSortOrder()
                    : devLog.getSortOrder()
            )
            .logDate(
                dto.getLogDate() != null
                    ? dto.getLogDate()
                    : devLog.getLogDate()
            )
            .summary(
                dto.getSummary() != null
                    ? dto.getSummary()
                    : devLog.getSummary()
            )
            .createdAt(devLog.getCreatedAt())
            .build();
        devLogRepository.update(updated);
    }

    @Transactional
    public void deleteDevLog(Long id, Long userId) {
        DevLog devLog = devLogRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.DEVLOG_NOT_FOUND)
            );
        if (!devLog.getUserId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN_DELETE);
        }
        devLogRepository.softDelete(id);
    }

    public List<Long> getLinkedIssueIds(Long devlogId) {
        return devLogRepository.findLinkedIssueIds(devlogId);
    }

    public List<Long> getLinkedWorkIds(Long devlogId) {
        return devLogRepository.findLinkedWorkIds(devlogId);
    }

    @Transactional
    public void linkIssue(Long devlogId, Long issueId) {
        devLogRepository.linkIssue(devlogId, issueId);
    }

    @Transactional
    public void unlinkIssue(Long devlogId, Long issueId) {
        devLogRepository.unlinkIssue(devlogId, issueId);
    }

    @Transactional
    public void linkWork(Long devlogId, Long workId) {
        devLogRepository.linkWork(devlogId, workId);
    }

    @Transactional
    public void unlinkWork(Long devlogId, Long workId) {
        devLogRepository.unlinkWork(devlogId, workId);
    }
}
