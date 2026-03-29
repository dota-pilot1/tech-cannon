package com.mapo.palantier.work.application;

import com.mapo.palantier.work.domain.WorkMessage;
import com.mapo.palantier.work.domain.WorkMessageWithUser;
import com.mapo.palantier.work.infrastructure.WorkMessageMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class WorkMessageService {

    private final WorkMessageMapper workMessageMapper;

    public WorkMessageService(WorkMessageMapper workMessageMapper) {
        this.workMessageMapper = workMessageMapper;
    }

    /**
     * 특정 업무의 메시지 목록 조회 (작성자 정보 포함)
     */
    public List<WorkMessageWithUser> getMessagesByWorkId(Long workId) {
        return workMessageMapper.findByWorkId(workId);
    }

    /**
     * 메시지 ID로 단일 메시지 조회
     */
    public WorkMessage getMessageById(Long id) {
        return workMessageMapper.findById(id);
    }

    /**
     * 메시지 생성
     */
    @Transactional
    public WorkMessage createMessage(Long workId, Long userId, String message) {
        WorkMessage workMessage = new WorkMessage();
        workMessage.setWorkId(workId);
        workMessage.setUserId(userId);
        workMessage.setMessage(message);
        workMessage.setIsDeleted(false);

        workMessageMapper.insert(workMessage);
        return workMessage;
    }

    /**
     * 메시지 수정
     */
    @Transactional
    public void updateMessage(Long id, String message) {
        WorkMessage workMessage = workMessageMapper.findById(id);
        if (workMessage == null) {
            throw new RuntimeException("Message not found: " + id);
        }

        workMessageMapper.update(id, message);
    }

    /**
     * 메시지 삭제 (소프트 삭제)
     */
    @Transactional
    public void deleteMessage(Long id) {
        WorkMessage workMessage = workMessageMapper.findById(id);
        if (workMessage == null) {
            throw new RuntimeException("Message not found: " + id);
        }

        workMessageMapper.softDelete(id);
    }

    /**
     * 특정 업무의 전체 메시지 개수 조회
     */
    public int getMessageCount(Long workId) {
        return workMessageMapper.countByWorkId(workId);
    }
}
