package com.mapo.palantier.devlog;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DevLogService {

    private final DevLogMapper devLogMapper;

    public List<DevLog> getMyDevLogs(Long userId) {
        return devLogMapper.findByUserId(userId);
    }

    @Transactional
    public Long createDevLog(DevLogDto dto, Long userId) {
        DevLog devLog = DevLog.builder()
            .userId(userId)
            .title(dto.getTitle() != null ? dto.getTitle() : "제목 없음")
            .content(dto.getContent())
            .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
            .logDate(dto.getLogDate())
            .summary(dto.getSummary())
            .build();
        devLogMapper.insert(devLog);
        return devLog.getId();
    }

    @Transactional
    public void updateDevLog(Long id, DevLogDto dto, Long userId) {
        DevLog devLog = devLogMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "개발 일지를 찾을 수 없습니다: " + id
                )
            );
        if (!devLog.getUserId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다");
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
        devLogMapper.update(updated);
    }

    @Transactional
    public void deleteDevLog(Long id, Long userId) {
        DevLog devLog = devLogMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "개발 일지를 찾을 수 없습니다: " + id
                )
            );
        if (!devLog.getUserId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다");
        }
        devLogMapper.softDelete(id);
    }

    public List<Long> getLinkedIssueIds(Long devlogId) {
        return devLogMapper.findLinkedIssueIds(devlogId);
    }

    public List<Long> getLinkedWorkIds(Long devlogId) {
        return devLogMapper.findLinkedWorkIds(devlogId);
    }

    @Transactional
    public void linkIssue(Long devlogId, Long issueId) {
        devLogMapper.linkIssue(devlogId, issueId);
    }

    @Transactional
    public void unlinkIssue(Long devlogId, Long issueId) {
        devLogMapper.unlinkIssue(devlogId, issueId);
    }

    @Transactional
    public void linkWork(Long devlogId, Long workId) {
        devLogMapper.linkWork(devlogId, workId);
    }

    @Transactional
    public void unlinkWork(Long devlogId, Long workId) {
        devLogMapper.unlinkWork(devlogId, workId);
    }
}
