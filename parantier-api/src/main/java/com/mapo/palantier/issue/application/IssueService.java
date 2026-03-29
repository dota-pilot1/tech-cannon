package com.mapo.palantier.issue.application;

import com.mapo.palantier.issue.domain.Issue;
import com.mapo.palantier.issue.infrastructure.IssueMapper;
import com.mapo.palantier.issue.presentation.dto.IssueReorderItem;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class IssueService {

    private final IssueMapper issueMapper;

    public IssueService(IssueMapper issueMapper) {
        this.issueMapper = issueMapper;
    }

    public List<Issue> getAllIssues(
        String status,
        String category,
        String priority,
        Long assigneeId,
        Long authorId,
        Long folderId,
        String keyword,
        String sortBy,
        Integer page,
        Integer limit
    ) {
        Map<String, Object> params = new HashMap<>();
        params.put("status", status);
        params.put("category", category);
        params.put("priority", priority);
        params.put("assigneeId", assigneeId);
        params.put("authorId", authorId);
        params.put("folderId", folderId);
        params.put("keyword", keyword);
        params.put("sortBy", sortBy);

        if (page != null && limit != null) {
            params.put("offset", page * limit);
            params.put("limit", limit);
        }

        return issueMapper.findAll(params);
    }

    public Issue getIssueById(Long id) {
        return issueMapper.findById(id);
    }

    public int getTotalCount(
        String status,
        String category,
        String priority,
        Long assigneeId,
        Long authorId,
        Long folderId,
        String keyword
    ) {
        Map<String, Object> params = new HashMap<>();
        params.put("status", status);
        params.put("category", category);
        params.put("priority", priority);
        params.put("assigneeId", assigneeId);
        params.put("authorId", authorId);
        params.put("folderId", folderId);
        params.put("keyword", keyword);

        return issueMapper.count(params);
    }

    @Transactional
    public Issue createIssue(Issue issue) {
        issueMapper.insert(issue);
        return issue;
    }

    @Transactional
    public Issue updateIssue(Long id, Issue issue) {
        issue.setId(id);
        issueMapper.update(issue);
        return issueMapper.findById(id);
    }

    @Transactional
    public void deleteIssue(Long id) {
        issueMapper.delete(id);
    }

    @Transactional
    public void updateStatus(Long id, String status) {
        issueMapper.updateStatus(id, status);
    }

    @Transactional
    public void updateAssignee(Long id, Long assigneeId) {
        issueMapper.updateAssignee(id, assigneeId);
    }

    @Transactional
    public void updatePriority(Long id, String priority) {
        issueMapper.updatePriority(id, priority);
    }

    @Transactional
    public void reorderIssues(List<IssueReorderItem> items) {
        for (IssueReorderItem item : items) {
            issueMapper.updateOrderNum(item.getId(), item.getOrderNum());
        }
    }
}
