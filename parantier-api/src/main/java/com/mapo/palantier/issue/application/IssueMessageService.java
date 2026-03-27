package com.mapo.palantier.issue.application;

import com.mapo.palantier.issue.domain.IssueMessage;
import com.mapo.palantier.issue.domain.MessageWithUser;
import com.mapo.palantier.issue.infrastructure.IssueMessageMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class IssueMessageService {

    private final IssueMessageMapper issueMessageMapper;

    public IssueMessageService(IssueMessageMapper issueMessageMapper) {
        this.issueMessageMapper = issueMessageMapper;
    }

    /**
     * 특정 이슈의 메시지 목록 조회 (작성자 정보 포함)
     */
    public List<MessageWithUser> getMessagesByIssueId(Long issueId) {
        return issueMessageMapper.findByIssueId(issueId);
    }

    /**
     * 메시지 ID로 단일 메시지 조회
     */
    public IssueMessage getMessageById(Long id) {
        return issueMessageMapper.findById(id);
    }

    /**
     * 메시지 생성
     */
    @Transactional
    public IssueMessage createMessage(Long issueId, Long userId, String message) {
        IssueMessage issueMessage = new IssueMessage();
        issueMessage.setIssueId(issueId);
        issueMessage.setUserId(userId);
        issueMessage.setMessage(message);
        issueMessage.setIsDeleted(false);

        issueMessageMapper.insert(issueMessage);
        return issueMessage;
    }

    /**
     * 메시지 수정
     */
    @Transactional
    public void updateMessage(Long id, String message) {
        IssueMessage issueMessage = issueMessageMapper.findById(id);
        if (issueMessage == null) {
            throw new RuntimeException("Message not found: " + id);
        }

        issueMessage.setMessage(message);
        issueMessageMapper.update(issueMessage);
    }

    /**
     * 메시지 삭제 (소프트 삭제)
     */
    @Transactional
    public void deleteMessage(Long id) {
        IssueMessage issueMessage = issueMessageMapper.findById(id);
        if (issueMessage == null) {
            throw new RuntimeException("Message not found: " + id);
        }

        issueMessageMapper.delete(id);
    }

    /**
     * 특정 이슈의 전체 메시지 개수 조회
     */
    public int getMessageCount(Long issueId) {
        return issueMessageMapper.countByIssueId(issueId);
    }
}
